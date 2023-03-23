import { Resolver, ResolveField, Parent } from '@nestjs/graphql'

@Resolver('Translation')
export class TranslationResolver {
  @ResolveField('language')
  async language(
    @Parent() translation
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: translation.languageId }
  }
}
