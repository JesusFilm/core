import { Resolver, ResolveField, Parent } from '@nestjs/graphql'
import { compact } from 'lodash'

@Resolver('VideoVariant')
export class VideoVariantResolver {
  @ResolveField('language')
  async language(
    @Parent() videoVariant
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'Language', id: videoVariant.languageId }
  }

  @ResolveField('subtitleCount')
  subtitleCount(@Parent() videoVariant): number {
    return compact(videoVariant.subtitle).length
  }
}
