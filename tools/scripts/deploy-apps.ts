import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

async function main() {
  const args = process.argv
  // remove args:
  // '/workspaces/core/node_modules/.bin/ts-node',
  // '/workspaces/core/tools/scripts/affected-apps.ts',
  args.splice(0, 2)

  const { stdout: deployable } = await execAsync(
    `pnpm exec nx show projects --withTarget deploy ${args.join(' ')}`
  )

  const deployableServices = deployable
    .split('\n')
    .filter((value) => value != null && value !== '')

  const { stdout: affected } = await execAsync(
    `pnpm exec nx show projects --affected ${args.join(' ')}`
  )

  const services = [
    ...new Set(
      affected
        .split('\n')
        .map((value) => value.replace('-e2e', ''))
        .filter(
          (value) =>
            value != null && value !== '' && deployableServices.includes(value)
        )
    )
  ].join('","')

  if (services === '') {
    console.log('[]')
  } else {
    console.log(`["${services}"]`)
  }
}

void main()
