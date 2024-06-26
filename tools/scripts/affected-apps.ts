import { exec } from 'child_process'

const args = process.argv
args.splice(0, 2)
exec(
  `npx nx show projects --affected ${args.join(' ')}`,
  (_error, stdout, _stderr) => {
    let services = stdout
      .split('\n')
      .filter((value) => value != null && value !== '')

    // Filter out "-e2e" projects if their counterpart is also in the list
    services = services.filter((service) => {
      if (service.endsWith('-e2e')) {
        const baseService = service.replace('-e2e', '')
        return !services.includes(baseService)
      }
      return true
    })

    const output = services.join('","')
    if (output === '') {
      console.log('[]')
    } else {
      console.log(`["${output}"]`)
    }
  }
)