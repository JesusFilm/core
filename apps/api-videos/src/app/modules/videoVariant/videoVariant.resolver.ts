import { TranslationField } from '@core/nest/decorators/TranslationField'
import { Resolver, ResolveField, Parent, Args } from '@nestjs/graphql'

@Resolver('VideoVariant')
export class VideoVariantResolver {
  @ResolveField('language')
  async language(
    @Parent() videoVariant
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: videoVariant.languageId }
  }

  @ResolveField()
  @TranslationField('slug')
  slug(
    @Parent() language,
    @Args('languageId') languageId?: string,
    @Args('primary') primary?: boolean
  ): void {}
}
