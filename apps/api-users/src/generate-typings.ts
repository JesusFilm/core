import { join } from 'path'
import { GraphQLDefinitionsFactory } from '@nestjs/graphql'

const definitionsFactory = new GraphQLDefinitionsFactory()
definitionsFactory
  .generate({
    federation: true,
    typePaths: [join(process.cwd(), 'apps/api-users/src/app/**/*.graphql')],
    path: join(
      process.cwd(),
      'apps/api-users/src/app/__generated__/graphql.ts'
    ),
    outputAs: 'class',
    watch: true,
    emitTypenameField: true,
    customScalarTypeMapping: {
      DateTime: 'String'
    }
  })
  .catch((err) => console.log(err))
