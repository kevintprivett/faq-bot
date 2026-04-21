# FAQ-BOT

This project is a simple discord bot that servers pre-determined answers to slash commands. Originally made to serve to serve Frequently Asked Questions on the [OSSU Discord](https://discord.com/channels/744385009028431943).  This project is meant to be deployed on CloudFlare Workers and should stay under the 10 ms free limit, though it should be straightforward to modify this code to run as a long-running instance.

## Updating Slash Commands

[src/commands.ts] can be updated as needed to add, remove, or modify the slash commands.

```js
slash_command: { // this will be the eventual slash command
    description: 'Description that bot supplies during autocomplete',
    response: 'The text response served in Discord when activated',
    type: 1 // Ref: https://docs.discord.com/developers/interactions/application-commands#application-command-object-application-command-types
}
```

CI/CD will handle the update process upon merge. Otherwise see below.

## Setup

[.env.example] will detail all the necessary integration secrets. The guild id refers to the specific discord guild that is being targeted with npm run register.

Ref: https://docs.discord.com/developers/quick-start/getting-started#step-1-creating-an-app
Ref: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/

Rename this example env file to .env and run npm run secrets in order to push the .env file to cloudflare secrets.

Once the cloudflare worker is deployed and functional, you'll also need to add the deployed endpoint in your discord developer portal.

Ref: https://docs.discord.com/developers/interactions/overview#configuring-an-interactions-endpoint-url

Additionally, [wrangler.jsonc] has some configuration for rate limiting that can be adjusted.

## Development and Deployment

npm run lint -> eslint
npm run lint:fix -> eslint --fix
npm run format -> prettier formatting

npm run build -> transpile the application to be ready for upload.
npm run register -> register the commands with discord for autocomplete
npm run secrets -> push local .env file to cloudflare secrets
npm run publish -> deploy the code to cloudflare workers

## Tech Stack

Typescript, Hono