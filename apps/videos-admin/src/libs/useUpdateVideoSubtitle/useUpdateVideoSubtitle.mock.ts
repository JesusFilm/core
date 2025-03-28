import { MockedResponse } from '@apollo/client/testing'

import {
  UPDATE_VIDEO_SUBTITLE,
  UpdateVideoSubtitle,
  UpdateVideoSubtitleVariables
} from './useUpdateVideoSubtitle'

export const getUpdateVideoSubtitleMock = (
  input: UpdateVideoSubtitleVariables['input']
): MockedResponse<UpdateVideoSubtitle, UpdateVideoSubtitleVariables> => ({
  request: {
    query: UPDATE_VIDEO_SUBTITLE,
    variables: {
      input
    }
  },
  result: jest.fn(() => ({
    data: {
      videoSubtitleUpdate: {
        id: input.id,
        value: input.vttSrc ?? input.srtSrc ?? '',
        primary: input.primary ?? false,
        vttSrc: input.vttSrc ?? null,
        srtSrc: input.srtSrc ?? null,
        language: {
          id: input.languageId ?? '',
          name: [
            {
              value: 'Test Language',
              primary: true
            }
          ],
          slug: 'test-language'
        },
        vttAsset: input.vttAssetId ? { id: input.vttAssetId } : null,
        srtAsset: input.srtAssetId ? { id: input.srtAssetId } : null,
        vttVersion: input.vttVersion ?? 1,
        srtVersion: input.srtVersion ?? 1
      }
    }
  }))
})
