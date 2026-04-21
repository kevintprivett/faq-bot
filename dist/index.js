import { Hono } from 'hono'
import { verifyKey } from 'discord-interactions'
import { InteractionType } from 'discord-api-types/v10'
import { HELLO_COMMAND } from './commands.js'
class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body)
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }
    super(jsonBody, init)
  }
}
/*
TODO:
This is a mashing together of a hono example and a discord example. Should do
some testing before moving on.
*/
const app = new Hono()
app.post('/', async (c) => {
  const request = c.req
  const env = c.env
  const { isValid, interaction } = await verifyDiscordRequest(request, env)
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 })
  }
  if (interaction.type === InteractionType.Ping) {
    return new JsonResponse({
      type: InteractionResponseType.Pong,
    })
  }
  if (interaction.type === InteractionType.ApplicationCommand) {
    switch (interaction.data.name.toLowerCase()) {
      case HELLO_COMMAND.name.toLowerCase(): {
        return new JsonResponse({
          type: InteractionResponseType.ChannelMessageWithSource,
          message: {
            content: 'World!',
          },
        })
      }
      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 404 })
    }
  }
  console.error('Unknown Type')
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 })
})
app.all('*', () => new Response('Not Found.', { status: 404 }))
async function verifyDiscordRequest(request, env) {
  if (request.method !== 'POST') {
    return { isValid: false }
  }
  // Using the incoming headers, verify this request actually came from discord.
  const signature = request.header('x-signature-ed25519')
  const timestamp = request.header('x-signature-timestamp')
  const body = await request.arrayBuffer()
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY))
  if (!isValidRequest) {
    return { isValid: false }
  }
  const json = request.json()
  return { interaction: json, isValid: true }
}
export default app
//# sourceMappingURL=index.js.map
