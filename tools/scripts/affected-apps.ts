import { exec } from 'child_process'

const args = process.argv
// remove args:
// '/workspaces/core/node_modules/.bin/ts-node',
// '/workspaces/core/tools/scripts/affected-apps.ts',
args.splice(0, 2)
exec(
  `pnpm exec nx show projects --affected ${args.join(' ')}`,
  (_error, stdout, _stderr) => {
    const services = stdout
      .split('\n')
      .filter((value) => value != null && value !== '')
      .join('","')
    if (services === '') {
      console.log('[]')
    } else {
      console.log(`["${services}"]`)
    }
  }
)
