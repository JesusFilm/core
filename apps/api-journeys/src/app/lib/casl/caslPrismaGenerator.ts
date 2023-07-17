import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Prisma } from '.prisma/api-journeys-client'
import keys from 'lodash/keys'
import chalk from 'chalk'

// this script is run automatically on `nx generate-prisma api-journeys`

const imports = keys(Prisma.ModelName)
  .map((value) => `  ${value}`)
  .join(', \n')
const subjects = keys(Prisma.ModelName)
  .map((value) => `  ${value}: ${value}`)
  .join(', \n')

const contents = `// This file is generated automatically.
// Do not edit it manually.
import { Subjects } from '@casl/prisma'
import {
${imports}
} from '.prisma/api-journeys-client'

export type PrismaSubjects = Subjects<{
${subjects}
}>`

if (!existsSync(join(__dirname, '__generated__'))) {
  mkdirSync(join(__dirname, '__generated__'), 0o744)
}

writeFileSync(join(__dirname, '__generated__', 'prismaSubjects.ts'), contents, {
  flag: 'w'
})

console.log(
  '✔ Generated',
  chalk.bold('Prisma Subjects'),
  chalk.grey(
    'to apps/api-journeys/src/app/lib/casl/__generated__/prismaSubjects.ts'
  )
)
