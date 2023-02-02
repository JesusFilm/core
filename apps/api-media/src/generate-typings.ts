import { join } from 'path'
import { GraphQLFederationDefinitionsFactory } from '@nestjs/graphql'

const definitionsFactory = new GraphQLFederationDefinitionsFactory()
definitionsFactory
  .generate({
    typePaths: [join(process.cwd(), 'apps/api-media/src/app/**/*.graphql')],
    path: join(
      process.cwd(),
      'apps/api-media/src/app/__generated__/graphql.ts'
    ),
    outputAs: 'class',
    watch: true,
    emitTypenameField: true,
    customScalarTypeMapping: {
      DateTime: 'String'
    },
    debug: false
  })
  .catch((err) => console.log(err))
