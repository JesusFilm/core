import { Resolver, ResolveField, Parent } from '@nestjs/graphql'

@Resolver('VideoVariant')
export class VideoVariantResolver {
  @ResolveField('language')
  async language(
    @Parent() videoVariant
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: videoVariant.languageId }
  }
}
