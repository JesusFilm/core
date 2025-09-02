import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import chalk from 'chalk'
import keys from 'lodash/keys'
import sortBy from 'lodash/sortBy'

import { Prisma } from '@core/prisma/journeys/client'

// this script is run automatically on `nx generate-prisma api-journeys`

const models = sortBy(keys(Prisma.ModelName))

const imports = models.map((value) => `  ${value}`).join(', \n')
const subjects = models.map((value) => `  ${value}: ${value}`).join(', \n')

const contents = `// This file is generated automatically.
// Do not edit it manually.
import { Subjects } from '@casl/prisma'

import {
${imports}
} from '@core/prisma/journeys/client'

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
    'to apis/api-journeys/src/app/lib/casl/__generated__/prismaSubjects.ts'
  )
)
