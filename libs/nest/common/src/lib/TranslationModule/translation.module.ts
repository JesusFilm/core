import { Module } from '@nestjs/common'
import { TranslationResolver } from './translation.resolver'

/* To use TranslationModule you must make sure the path to the
 * translation.graphql is added to the typePaths array in app.module.ts file:
 * join(
 *   process.cwd(),
 *   'libs/nest/common/src/lib/TranslationModule/translation.graphql'
 * )
 */

@Module({
  providers: [TranslationResolver]
})
export class TranslationModule {}
