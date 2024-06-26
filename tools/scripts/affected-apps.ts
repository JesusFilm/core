import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

async function main() {
  const args = process.argv
  // remove args:
  // '/workspaces/core/node_modules/.bin/ts-node',
  // '/workspaces/core/tools/scripts/affected-apps.ts',
  args.splice(0, 2)

  const { stdout: affected } = await execAsync(
    `npx nx show projects --affected ${args.join(' ')}`
  )

  const services = affected
    .split('\n')
    .filter((value) => value != null && value !== '')
    .join('","')

  if (services === '') {
    console.log('[]')
  } else {
    console.log(`["${services}"]`)
  }
}

void main()
