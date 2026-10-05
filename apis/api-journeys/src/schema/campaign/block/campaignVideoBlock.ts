import { builder } from '../../builder'
import { VideoBlockSource } from '../../enums'
import { MediaVideo } from '../../mediaVideo/mediaVideo'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'

function isMediaVideoSource(
  source: string
): source is 'internal' | 'mux' | 'youTube' {
  return source === 'internal' || source === 'mux' || source === 'youTube'
}

export const CampaignVideoBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignVideoBlock',
  interfaces: [CampaignBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignVideoBlock',
  description:
    'The Campaign Video: a reference to a Watch Video (`internal`), a YouTube video or an uploaded Mux video, with optional title and description overrides. Owned by a hero or Featured Media section through its `mediaBlockId` (`parentOrder: null`). YouTube and Mux text, poster and duration are captured once when the video is picked; Watch text is read live through `mediaVideo` in the campaign language, the row’s overrides winning.',
  fields: (t) => ({
    source: t.field({
      type: VideoBlockSource,
      nullable: true,
      description: 'Always `internal`, `youTube` or `mux`.',
      resolve: (block) => block.source
    }),
    videoId: t.exposeID('videoId', {
      nullable: true,
      description:
        'The Watch Video id, the YouTube video id or the Mux video id, by `source`.'
    }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true,
      description:
        'For `internal`: the campaign language at link time; the language `mediaVideo` resolves in.'
    }),
    title: t.exposeString('title', {
      nullable: true,
      description:
        'The author’s override (at most 200 characters), or for YouTube and Mux the title captured at pick. Null on a Watch video means the Video’s own title.'
    }),
    titleTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.titleTranslations)
    }),
    description: t.exposeString('description', {
      nullable: true,
      description:
        'The author’s override (at most 1000 characters), or for YouTube the description captured at pick. Null on a Watch video means the Video’s own text.'
    }),
    descriptionTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.descriptionTranslations)
    }),
    image: t.exposeString('image', {
      nullable: true,
      description:
        'The poster captured at pick for YouTube and Mux; null for a Watch video (read through `mediaVideo`).'
    }),
    duration: t.exposeInt('duration', {
      nullable: true,
      description: 'Seconds, captured at pick for YouTube and Mux.'
    }),
    mediaVideo: t.field({
      type: MediaVideo,
      nullable: true,
      description:
        'The federated video reference (`Video`, `YouTube` or `MuxVideo` by `source`, with `id` and `primaryLanguageId`); the gateway resolves it, api-journeys never does.',
      // No `select`: every campaign read hands over full rows, and the public
      // payload's blocks are not Pothos-loaded, so a selection would refetch
      // each video row.
      resolve: (block) => {
        if (
          block.source == null ||
          !isMediaVideoSource(block.source) ||
          block.videoId == null
        )
          return null
        return {
          id: block.videoId,
          primaryLanguageId: block.videoVariantLanguageId,
          source: block.source
        }
      }
    })
  })
})
