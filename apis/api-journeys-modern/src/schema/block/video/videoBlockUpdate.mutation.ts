import { GraphQLError } from 'graphql'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'
import { update } from '../service'

import { VideoBlockUpdateInput } from './inputs'
import {
  fetchFieldsFromMux,
  fetchFieldsFromYouTube,
  videoBlockInternalSchema,
  videoBlockMuxSchema,
  videoBlockYouTubeSchema
} from './service'
import { VideoBlock } from './video'

builder.mutationField('videoBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: VideoBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: VideoBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input: initialInput } = args

      const block = await fetchBlockWithJourneyAcl(id)
      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update video block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      let input = { ...initialInput }

      const isChangingSource =
        initialInput.source != null &&
        block.source != null &&
        initialInput.source !== block.source

      const isChangingVideo =
        initialInput.videoId != null &&
        block.videoId != null &&
        initialInput.videoId !== block.videoId

      // used to clear the subtitle language when changing the source or video
      const shouldClearSubtitleLanguage = isChangingSource || isChangingVideo

      switch (initialInput.source ?? block.source) {
        case 'youTube':
          videoBlockYouTubeSchema.parse({
            ...block,
            ...input
          })
          if (input.videoId != null) {
            input = {
              ...input,
              subtitleLanguageId: shouldClearSubtitleLanguage
                ? null
                : (input?.subtitleLanguageId ?? block?.subtitleLanguageId),
              ...(await fetchFieldsFromYouTube(input.videoId))
            }
          }
          break
        case 'internal':
          videoBlockInternalSchema.parse({
            ...block,
            ...input
          })
          input = {
            ...input,
            title: null,
            description: null,
            image: null,
            duration: null,
            subtitleLanguageId: shouldClearSubtitleLanguage
              ? null
              : (input?.subtitleLanguageId ?? block?.subtitleLanguageId)
          }
          break
        case 'mux':
          videoBlockMuxSchema.parse({
            ...block,
            ...input
          })
          if (input.videoId != null) {
            input = {
              ...input,
              subtitleLanguageId: shouldClearSubtitleLanguage
                ? null
                : (input?.subtitleLanguageId ?? block?.subtitleLanguageId),
              ...(await fetchFieldsFromMux(input.videoId))
            }
          }
          break
      }

      return await update(id, {
        ...input
      })
    }
  })
)
