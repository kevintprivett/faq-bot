import { Hono, type HonoRequest } from 'hono'
import { verifyKey } from 'discord-interactions'
import {
  InteractionResponseType,
  InteractionType,
  type APIInteraction,
} from 'discord-api-types/v10'
import 'dotenv/config'

import commands from './commands.js'

type Bindings = {
  DEFAULT_RATE_LIMIT: RateLimit
}

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  const { success } = await c.env.DEFAULT_RATE_LIMIT.limit({ key: 'default' })

  if (!success) {
    console.info('Rate limit triggered')
    return c.text('Rate Limited', 429)
  }

  const request = c.req

  const { isValid, interaction } = await verifyDiscordRequest(request)

  if (!isValid || !interaction) {
    console.error('Bad request signature')
    return c.text('Bad request signature.', 401)
  }

  if (interaction.type === InteractionType.Ping) {
    console.info('Pong')
    return c.json({
      type: InteractionResponseType.Pong,
    })
  }

  if (interaction.type === InteractionType.ApplicationCommand) {
    const command = interaction.data.name
    if (command in commands) {
      console.info(command)
      const commandValue = commands[command as keyof typeof commands]

      return c.json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: commandValue.response,
        },
      })
    } else {
      console.error('Unknown Command')
      return c.text('Unknown Command', 404)
    }
  }

  console.error('Unknown Interaction Type')
  return c.text('Unknown Interaction Type', 404)
})

app.all('*', () => {
  console.info('catch all 404')
  return new Response('Not Found.', { status: 404 })
})

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
    console.info('Post request was not valid')
    return { isValid: false }
  }

  const json = (await request.json()) as APIInteraction

  console.info('Post request is valid')
  return { interaction: json, isValid: true }
}

export default app
