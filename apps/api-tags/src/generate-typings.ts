import { join } from 'path'
import { GraphQLFederationDefinitionsFactory } from '@nestjs/graphql'

const definitionsFactory = new GraphQLFederationDefinitionsFactory()
definitionsFactory
  .generate({
    typePaths: [
      join(process.cwd(), 'apps/api-tags/src/app/**/*.graphql'),
      join(
        process.cwd(),
        'libs/nest/common/src/lib/TranslationModule/translation.graphql'
      )
    ],
    path: join(process.cwd(), 'apps/api-tags/src/app/__generated__/graphql.ts'),
    outputAs: 'class',
    watch: true,
    emitTypenameField: true,
    customScalarTypeMapping: {
      DateTime: 'String'
    },
    debug: false
  })
  .catch((err) => console.log(err))
