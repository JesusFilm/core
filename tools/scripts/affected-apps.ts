import { exec } from 'child_process'

const args = process.argv
args.splice(0, 2)
exec(
  `npx nx show projects --affected ${args.join(' ')}`,
  (_error, stdout, _stderr) => {
    let services = stdout
      .split('\n')
      .filter((value) => value != null && value !== '')

    let appsProjects = services.filter(service => !service.endsWith('-e2e'))
    const e2eProjects = services.filter(service => service.endsWith('-e2e'))

    // If each e2e projects (after removing the word '-e2e') is not already included in apps project, add it
    appsProjects = appsProjects.concat(e2eProjects.map(each => each.replace('-e2e', ''))).filter((value, index, self) => self.indexOf(value) === index)

    const output = appsProjects.join('","')
    if (output === '') {
      console.log('[]')
    } else {
      console.log(`["${output}"]`)
    }
  }
)