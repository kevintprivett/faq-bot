import { Hono, type HonoRequest } from 'hono'
import { verifyKey } from 'discord-interactions'
import {
  InteractionResponseType,
  InteractionType,
  type APIInteraction,
} from 'discord-api-types/v10'
import { HELLO_COMMAND } from './commands.js'

/*
TODO:
This is a mashing together of a hono example and a discord example. Should do
some testing before moving on.
*/

const app = new Hono()

app.post('/', async (c) => {
  const request = c.req

  const { isValid, interaction } = await verifyDiscordRequest(request)

  if (!isValid || !interaction) {
    return c.text('Bad request signature.', 401)
  }

  if (interaction.type === InteractionType.Ping) {
    return c.json({
      type: InteractionResponseType.Pong,
    })
  }

  if (interaction.type === InteractionType.ApplicationCommand) {
    switch (interaction.data.name.toLowerCase()) {
      case HELLO_COMMAND.name.toLowerCase(): {
        return c.json({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: 'World!',
          },
        })
      }
      default:
        return c.text('Unknown Type', 404)
    }
  }

  console.error('Unknown Type')
  return c.text('Unknown Type', 404)
})

app.all('*', () => new Response('Not Found.', { status: 404 }))

async function verifyDiscordRequest(
  request: HonoRequest
): Promise<{ isValid: boolean; interaction?: APIInteraction }> {
  if (request.method !== 'POST') {
    return { isValid: false }
  }

  const DISCORD_PUBLIC_KEY = process.env['DISCORD_PUBLIC_KEY']

  if (!DISCORD_PUBLIC_KEY) {
    throw new Error('The DISCORD_PUBLIC_KEY environment variable is required.')
  }

  // Using the incoming headers, verify this request actually came from discord.
  const signature = request.header('x-signature-ed25519')
  const timestamp = request.header('x-signature-timestamp')
  const body = await request.arrayBuffer()

  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY))

  if (!isValidRequest) {
    return { isValid: false }
  }

  const json = (await request.json()) as APIInteraction

  return { interaction: json, isValid: true }
}

export default app
