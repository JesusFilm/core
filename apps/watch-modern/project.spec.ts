import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface NxRunCommandsTarget {
  options: {
    commands: Array<string | { command: string }>
  }
}

interface WatchModernProjectConfig {
  targets: {
    deploy: NxRunCommandsTarget & {
      configurations: {
        production: NxRunCommandsTarget['options']
      }
    }
    'upload-sourcemaps': NxRunCommandsTarget
  }
}

function readWatchModernProjectConfig(): WatchModernProjectConfig {
  return JSON.parse(
    readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), 'project.json'),
      'utf8'
    )
  ) as WatchModernProjectConfig
}

function commandText(command: string | { command: string }): string {
  return typeof command === 'string' ? command : command.command
}

describe('watch-modern project Datadog configuration', () => {
  it('uploads sourcemaps through the Watch Datadog upload script', () => {
    const project = readWatchModernProjectConfig()
    const uploadCommands =
      project.targets['upload-sourcemaps'].options.commands.map(commandText)

    expect(uploadCommands).toEqual([
      'pnpm exec tsx apps/watch-modern/scripts/datadog-sourcemaps.ts upload'
    ])
    expect(uploadCommands.join(' ')).not.toContain('--service=watch-modern')
  })

  it('removes public JavaScript sourcemaps before Vercel deploys preview and production artifacts', () => {
    const project = readWatchModernProjectConfig()
    const previewCommands =
      project.targets.deploy.options.commands.map(commandText)
    const productionCommands =
      project.targets.deploy.configurations.production.commands.map(commandText)
    const removeCommand =
      'pnpm exec tsx apps/watch-modern/scripts/datadog-sourcemaps.ts remove-public'

    expect(previewCommands).toContain(removeCommand)
    expect(productionCommands).toContain(removeCommand)
    expect(previewCommands.indexOf(removeCommand)).toBeLessThan(
      previewCommands.findIndex((command) =>
        command.includes('vercel deploy --prebuilt')
      )
    )
    expect(productionCommands.indexOf(removeCommand)).toBeLessThan(
      productionCommands.findIndex((command) =>
        command.includes('vercel deploy --prebuilt --prod')
      )
    )
  })
})
