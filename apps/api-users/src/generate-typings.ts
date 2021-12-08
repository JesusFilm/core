import { GraphQLDefinitionsFactory } from '@nestjs/graphql'
import { join } from 'path'

const definitionsFactory = new GraphQLDefinitionsFactory()
definitionsFactory.generate({
  federation: true,
  typePaths: [join(process.cwd(), 'apps/api-users/src/app/**/*.graphql')],
  path: join(process.cwd(), 'apps/api-users/src/app/graphql.ts'),
  outputAs: 'class',
  watch: true,
  customScalarTypeMapping: {
    DateTime: 'String'
  }
})