import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

@Resolver('Keyword')
export class KeywordResolver {
  @ResolveField('language')
  async language(
    @Parent() keyword
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: keyword.languageId }
  }
}
