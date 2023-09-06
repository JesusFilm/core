import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

export interface Translation {
  value: string
  languageId: string
  primary: boolean
}

@Resolver('Translation')
export class TranslationResolver {
  @ResolveField('language')
  async language(
    @Parent() translation: Translation
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: translation.languageId }
  }
}
