import { Module } from '@nestjs/common'

import { TranslationResolver } from './translation.resolver'

/* To use TranslationModule in an api project update the following:
 * - add translation.graphql to the typePaths array in app.module.ts file:
 * join(
 *   process.cwd(),
 *   'libs/nest/common/src/lib/TranslationModule/translation.graphql'
 * )
 * - add to targets.build.options.assets array in projects.json
 * {
 *   "glob": "**\/*.graphql",
 *   "input": "libs/nest/common/src/lib/TranslationModule/",
 *   "output": "./assets"
 * }
 */

@Module({
  providers: [TranslationResolver]
})
export default class TranslationModule {}
