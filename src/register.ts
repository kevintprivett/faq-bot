import 'dotenv/config'
import commands from './commands.js'

/**
 * This file is meant to be run from the command line, and is not used by the
 * application server.  It's allowed to use node.js primitives, and only needs
 * to be run once.
 */

const token = process.env['DISCORD_BOT_TOKEN']
const applicationId = process.env['DISCORD_APPLICATION_ID']
const guildId = process.env['DISCORD_GUILD_ID']

if (!token) {
  throw new Error('The DISCORD_BOT_TOKEN environment variable is required.')
}
if (!applicationId) {
  throw new Error(
    'The DISCORD_APPLICATION_ID environment variable is required.'
  )
}

/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */
async function registerCommands() {
  const transformedCommands = []

  for (const [key, value] of Object.entries(commands)) {
    transformedCommands.push({
      name: key,
      ...value,
    })
  }

  const url = `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(transformedCommands),
  })

  if (response.ok) {
    console.log('Registered all commands')
  } else {
    console.error('Error registering commands')
    const text = await response.text()
    console.error(text)
  }
  return response
}

await registerCommands()
