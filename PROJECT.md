### TODO:

- Create system to generate commands from a static json file, needs to update the register script and index script
- Rate limiting: Explore built in options for cf workers, otherwise do a simple in memory map to track rate limiting
- Create a system to generate the faq commands from OSSU
- chore: make .env.example
- chore: make README with instructions for deployment
- chore: make thin wrapper that can be deployed on a standalone server instead

### Features:

- hard coded json file in repo that allows documented updates to the slash commands
- rescan OSSU faq on merge and update this automatically
- Rate limiting (requires state -> KV for rate limiting, though [this](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) seems promising, KV will introduce a lot of latency compared to just serving the reply), otherwise might be best to do just an in memory check, this should at least catch serious abuse.

### Notes:

#### Cloudflare FaaS cost:

- Workers are cheap but not free, 0.02 / million CPU ms past 10 ms / request -> $22/year if there are 1k/year at 3s each? Seems like a pretty reasonable top end, should be able to be much better than this.
- KV for rate limiting -> 1 GB, 100k reads free (easy), 1k writes per day should be plenty but would be the bottle neck, depends on the implementation of rate limiting.

#### discord example:

- https://github.com/discord/cloudflare-sample-app

### Claude project file

# project.md — Discord FAQ Bot on Cloudflare Workers

## Overview

A Discord bot that responds to slash commands with FAQ content. Hosted on Cloudflare Workers using Discord's HTTP Interactions model. Uses in-memory best-effort rate limiting based on user roles. No WebSocket gateway, no persistent server.

---

## Tech Stack

| Component              | Technology                           |
| ---------------------- | ------------------------------------ |
| Runtime                | Cloudflare Workers                   |
| Language               | TypeScript                           |
| FAQ Storage            | Static JSON bundled with the worker  |
| Rate Limiting          | In-memory Map on warm isolates       |
| Signature Verification | discord-interactions npm package     |
| Deployment             | Wrangler CLI                         |
| Command Registration   | One-time script via Discord REST API |

---

## Architecture

```
User runs /faq topic:rules
      │
      ▼
Discord ──HTTP POST──▶ Cloudflare Worker (interactions endpoint)
                            │
                            ├─ 1. Verify Ed25519 signature
                            ├─ 2. Check interaction type (PING or APPLICATION_COMMAND)
                            ├─ 3. Extract user roles from interaction payload
                            ├─ 4. Check in-memory rate limit
                            ├─ 5. Look up FAQ entry from static data
                            ├─ 6. Return JSON response (embed or error)
                            │
Discord ◀──JSON response───┘
```

---

## Project Structure

```
discord-faq-bot/
├── src/
│   ├── index.ts              # Worker entry point, request router
│   ├── verify.ts             # Ed25519 signature verification
│   ├── commands.ts           # Slash command definitions
│   ├── handler.ts            # Interaction handler (dispatches by command)
│   ├── faq.ts                # FAQ data and lookup logic
│   ├── ratelimit.ts          # In-memory rate limiter
│   └── roles.ts              # Role-to-tier classification
├── scripts/
│   └── register-commands.ts  # One-time script to register slash commands with Discord
├── wrangler.toml             # Cloudflare Workers config
├── package.json
├── tsconfig.json
└── .dev.vars                 # Local env vars (not committed)
```

---

## Discord Application Setup

### Prerequisites

1. Create an application at https://discord.com/developers/applications
2. Note the **Application ID** and **Public Key** from the General Information page
3. Create a bot user under the Bot tab, note the **Bot Token**
4. Invite the bot to your server using this OAuth2 URL format:
   ```
   https://discord.com/oauth2/authorize?client_id=APPLICATION_ID&scope=bot+applications.commands
   ```
   No special bot permissions are required since the bot only responds to interactions.

### Set Interactions Endpoint URL

After deploying the worker, set the **Interactions Endpoint URL** in the Discord Developer Portal → General Information to:

```
https://your-worker-name.your-subdomain.workers.dev
```

Discord will send a PING to verify the endpoint. The worker must respond correctly for this to save.

---

## Environment Variables

Stored in `wrangler.toml` (non-secret) and `.dev.vars` / Cloudflare dashboard (secrets).

| Variable                 | Secret? | Description                                        |
| ------------------------ | ------- | -------------------------------------------------- |
| `DISCORD_APPLICATION_ID` | No      | Application ID from Developer Portal               |
| `DISCORD_PUBLIC_KEY`     | No      | Public key for signature verification              |
| `DISCORD_BOT_TOKEN`      | Yes     | Bot token, only needed for the registration script |

`wrangler.toml`:

```toml
name = "discord-faq-bot"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
DISCORD_APPLICATION_ID = ""
DISCORD_PUBLIC_KEY = ""
```

`.dev.vars`:

```
DISCORD_BOT_TOKEN=your-bot-token-here
```

---

## Slash Commands

### /faq

| Parameter | Type   | Required | Autocomplete | Description                  |
| --------- | ------ | -------- | ------------ | ---------------------------- |
| `topic`   | String | Yes      | Yes          | The FAQ topic key to look up |

Returns an embed with the FAQ content for the given topic.

### /faq-list

Returns an ephemeral message listing all available FAQ topic keys and their titles.

**Note:** These are registered as two separate top-level commands rather than subcommands to keep the implementation simple.

---

## Command Registration Script

`scripts/register-commands.ts` makes a PUT request to the Discord API to register both commands. This is run once manually (and again whenever command definitions change). It is not part of the deployed worker.

**Endpoint:**

```
PUT https://discord.com/api/v10/applications/{APPLICATION_ID}/commands
```

**Payload:**

```json
[
  {
    "name": "faq",
    "description": "Look up a frequently asked question",
    "type": 1,
    "options": [
      {
        "name": "topic",
        "description": "The FAQ topic to look up",
        "type": 3,
        "required": true,
        "autocomplete": true
      }
    ]
  },
  {
    "name": "faq-list",
    "description": "List all available FAQ topics",
    "type": 1
  }
]
```

Run with:

```bash
npx tsx scripts/register-commands.ts
```

---

## FAQ Data Format

`src/faq.ts` exports a static map of FAQ entries.

```typescript
interface FaqEntry {
  title: string
  content: string
  color: number // Hex color for embed sidebar
}

const FAQ_DATA: Record<string, FaqEntry> = {
  rules: {
    title: 'Server Rules',
    content:
      '1. Be respectful to all members\n2. No spam or self-promotion\n3. Keep discussions in the appropriate channels\n4. No NSFW content\n5. Follow Discord ToS',
    color: 0x5865f2,
  },
  roles: {
    title: 'How to Get Roles',
    content:
      'Visit the #role-select channel and use the dropdown menu to pick your roles.',
    color: 0x57f287,
  },
  // Add more entries as needed
}
```

### Lookup Function

- `getFaq(topic: string): FaqEntry | null` — exact key match
- `getAllTopics(): { key: string; title: string }[]` — returns all keys and titles for the list command
- `searchTopics(partial: string): { key: string; title: string }[]` — filters keys/titles that contain the partial string, used for autocomplete (max 25 results per Discord limit)

---

## Role-Based Rate Limiting

### Tier Classification

`src/roles.ts` maps Discord role IDs to rate limit tiers.

```typescript
interface RateLimitTier {
  name: string
  maxUses: number // Max invocations per window. -1 = unlimited.
  windowMs: number // Sliding window in milliseconds.
}

const TIERS: Record<string, RateLimitTier> = {
  staff: { name: 'staff', maxUses: -1, windowMs: 60_000 },
  trusted: { name: 'trusted', maxUses: 10, windowMs: 60_000 },
  default: { name: 'default', maxUses: 3, windowMs: 60_000 },
}

// Map role IDs to tiers. Checked in order, first match wins.
const ROLE_TIER_MAP: { roleId: string; tier: string }[] = [
  { roleId: 'MODERATOR_ROLE_ID_HERE', tier: 'staff' },
  { roleId: 'BOOSTER_ROLE_ID_HERE', tier: 'trusted' },
]
```

**Classification logic:** Iterate `ROLE_TIER_MAP` in order. If the user has the role, return that tier. If no roles match, return `"default"`.

### Rate Limiter

`src/ratelimit.ts` uses a module-level `Map<string, number[]>` that persists across warm invocations on the same isolate.

```typescript
// Module-level state — survives across warm invocations
const usageMap = new Map<string, number[]>()
```

**`checkRateLimit(userId: string, tier: RateLimitTier): { allowed: boolean }`**

1. If `tier.maxUses === -1`, return `{ allowed: true }`
2. Get or create the timestamp array for `userId`
3. Filter out timestamps older than `Date.now() - tier.windowMs`
4. If `timestamps.length >= tier.maxUses`, return `{ allowed: false }`
5. Push `Date.now()` onto the array, update the map
6. Return `{ allowed: true }`

**Cleanup:** On every invocation, if `usageMap.size > 10_000`, clear the entire map to prevent unbounded memory growth. This is a simple safeguard; false negatives (allowing an extra request) are acceptable.

---

## Request Handling Flow

`src/index.ts` — the worker entry point:

```
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    1. Reject anything that is not POST
    2. Verify the Ed25519 signature using the raw body, headers, and env.DISCORD_PUBLIC_KEY
       → If invalid, return 401
    3. Parse the JSON body
    4. If type === InteractionType.PING (type 1)
       → Return { type: 1 } (PONG)
    5. If type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE (type 4)
       → Call autocomplete handler
       → Return autocomplete choices
    6. If type === InteractionType.APPLICATION_COMMAND (type 2)
       → Extract user ID and roles from interaction.member
       → Determine tier from roles
       → Check rate limit
       → If rate limited, return ephemeral message: "You're using this too fast. Try again shortly."
       → Otherwise, dispatch to the appropriate command handler
       → Return the command response
    7. Return 400 for unknown interaction types
  }
};
```

---

## Response Formats

All responses are JSON with `Content-Type: application/json`.

### FAQ Embed Response (public)

```json
{
  "type": 4,
  "data": {
    "embeds": [
      {
        "title": "Server Rules",
        "description": "1. Be respectful to all members\n2. ...",
        "color": 5793266
      }
    ]
  }
}
```

### FAQ List Response (ephemeral)

```json
{
  "type": 4,
  "data": {
    "content": "**Available FAQ Topics:**\n• `rules` — Server Rules\n• `roles` — How to Get Roles",
    "flags": 64
  }
}
```

### Topic Not Found (ephemeral)

```json
{
  "type": 4,
  "data": {
    "content": "No FAQ found for topic `unknown-topic`. Use `/faq-list` to see available topics.",
    "flags": 64
  }
}
```

### Rate Limited (ephemeral)

```json
{
  "type": 4,
  "data": {
    "content": "You're using this too fast. Try again shortly.",
    "flags": 64
  }
}
```

### Autocomplete Response

```json
{
  "type": 8,
  "data": {
    "choices": [
      { "name": "Server Rules", "value": "rules" },
      { "name": "How to Get Roles", "value": "roles" }
    ]
  }
}
```

**Note:** `flags: 64` is the bitfield for ephemeral messages.

---

## Signature Verification

`src/verify.ts` uses the Web Crypto API (available in Workers) to verify Ed25519 signatures.

**Inputs:**

- `X-Signature-Ed25519` header
- `X-Signature-Timestamp` header
- Raw request body (string)
- `DISCORD_PUBLIC_KEY` from environment

**Process:**

1. Import the public key as a `CryptoKey` using `crypto.subtle.importKey` with algorithm `Ed25519`
2. Construct the message to verify: `timestamp + body` (concatenated as UTF-8 bytes)
3. Convert the signature from hex to `Uint8Array`
4. Call `crypto.subtle.verify("Ed25519", key, signature, message)`
5. Return boolean

Alternatively, use the `discord-interactions` npm package which provides a `verifyKey` function that works in Workers.

---

## Dependencies

```json
{
  "dependencies": {
    "discord-interactions": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "wrangler": "^3.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0"
  }
}
```

---

## Development Workflow

```bash
# Install dependencies
npm install

# Run locally with hot reload
npx wrangler dev

# Use a tunnel (e.g., ngrok or cloudflared) to expose local worker
# Set the tunnel URL as the Interactions Endpoint in Discord Developer Portal for testing

# Register/update slash commands (run whenever command definitions change)
npx tsx scripts/register-commands.ts

# Deploy to production
npx wrangler deploy

# Update Interactions Endpoint URL in Discord Developer Portal to the production worker URL
```

---

## Testing

Manual testing via Discord is the primary method.

**Test cases:**

| #   | Action                                            | Expected Result                                     |
| --- | ------------------------------------------------- | --------------------------------------------------- |
| 1   | Run `/faq topic:rules`                            | Public embed with rules content                     |
| 2   | Run `/faq topic:nonexistent`                      | Ephemeral "not found" message                       |
| 3   | Run `/faq-list`                                   | Ephemeral list of all topics                        |
| 4   | Type `/faq topic:ru` and pause                    | Autocomplete suggests "rules"                       |
| 5   | Run `/faq` 4 times quickly as a default-tier user | 4th invocation returns ephemeral rate limit message |
| 6   | Run `/faq` as a staff-tier user repeatedly        | Never rate limited                                  |
| 7   | Send a GET request to the worker URL              | Returns non-200 (rejected)                          |
| 8   | Send a POST with an invalid signature             | Returns 401                                         |

---

## Adding/Editing FAQ Entries

Edit the `FAQ_DATA` object in `src/faq.ts` and redeploy:

```bash
# Edit src/faq.ts, then:
npx wrangler deploy
```

There is no runtime admin command for managing FAQs. All changes go through code and redeployment.

---

## Configuration Checklist

Before deploying, ensure:

- [ ] Application created in Discord Developer Portal
- [ ] `DISCORD_APPLICATION_ID` set in `wrangler.toml`
- [ ] `DISCORD_PUBLIC_KEY` set in `wrangler.toml`
- [ ] `DISCORD_BOT_TOKEN` set as a secret via `npx wrangler secret put DISCORD_BOT_TOKEN`
- [ ] Bot invited to the server with `bot` and `applications.commands` scopes
- [ ] Slash commands registered via `scripts/register-commands.ts`
- [ ] Worker deployed via `npx wrangler deploy`
- [ ] Interactions Endpoint URL set in Developer Portal and verified
- [ ] Role IDs in `src/roles.ts` updated to match your server's actual role IDs
- [ ] FAQ entries in `src/faq.ts` populated with your server's content
