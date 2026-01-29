import { join } from 'path'

import { GraphQLFederationDefinitionsFactory } from '@nestjs/graphql'

const definitionsFactory = new GraphQLFederationDefinitionsFactory()
definitionsFactory
  .generate({
    typePaths: [join(process.cwd(), 'apis/api-journeys/src/app/**/*.graphql')],
    path: join(
      process.cwd(),
      'apis/api-journeys/src/app/__generated__/graphql.ts'
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
