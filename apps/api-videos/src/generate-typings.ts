import { join } from 'path'
import { GraphQLFederationDefinitionsFactory } from '@nestjs/graphql'

const definitionsFactory = new GraphQLFederationDefinitionsFactory()
definitionsFactory
  .generate({
    typePaths: [join(process.cwd(), 'apps/api-videos/src/app/**/*.graphql')],
    path: join(
      process.cwd(),
      'apps/api-videos/src/app/__generated__/graphql.ts'
    ),
    outputAs: 'class',
    watch: true,
    emitTypenameField: true,
    customScalarTypeMapping: {
      DateTime: 'String'
    }
  })
  .catch((err) => console.log(err))
