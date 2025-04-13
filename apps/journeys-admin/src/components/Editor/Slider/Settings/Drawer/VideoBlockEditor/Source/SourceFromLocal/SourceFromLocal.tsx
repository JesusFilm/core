import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import get from 'lodash/get'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { VideoFields_mediaVideo_Video } from '@core/journeys/ui/Video/__generated__/VideoFields'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetVideoVariantLanguages } from '../../../../../../../../../__generated__/GetVideoVariantLanguages'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

export const GET_VIDEO_VARIANT_LANGUAGES = gql`
  query GetVideoVariantLanguages($id: ID!) {
    video(id: $id) {
      id
      variant {
        id
      }
      variantLanguages {
        id
        name(languageId: "529", primary: true) {
          value
          primary
        }
      }
    }
  }
`

interface SourceFromLocalProps {
  selectedBlock: TreeBlock<VideoBlock>
}

export function SourceFromLocal({
  selectedBlock
}: SourceFromLocalProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useQuery<GetVideoVariantLanguages>(
    GET_VIDEO_VARIANT_LANGUAGES,
    {
      variables: {
        id: get(selectedBlock, 'mediaVideo.id')
      },
      skip: get(selectedBlock, 'mediaVideo.id') == null
    }
  )
  const [language, setLanguage] = useState<string | undefined>()

  useEffect(() => {
    const localLanguage = data?.video?.variantLanguages
      .find((variant) => variant.id === selectedBlock?.videoVariantLanguageId)
      ?.name.find(({ primary }) => !primary)?.value
    const nativeLanguage = data?.video?.variantLanguages
      .find((variant) => variant.id === selectedBlock?.videoVariantLanguageId)
      ?.name.find(({ primary }) => primary)?.value
    let language = localLanguage ?? nativeLanguage
    if (
      language != null &&
      nativeLanguage != null &&
      nativeLanguage !== language
    )
      language = t('{{ language }} ({{ nativeLanguage }})', {
        language,
        nativeLanguage
      })
    setLanguage(language)
  }, [data?.video?.variantLanguages, selectedBlock?.videoVariantLanguageId, t])

  return (
    <>
      <Box sx={{ ml: 2, mr: 4 }}>
        <ImageBlockThumbnail
          selectedBlock={{
            src:
              (selectedBlock?.mediaVideo as VideoFields_mediaVideo_Video)
                ?.images?.[0]?.mobileCinematicHigh ?? '',
            alt:
              (selectedBlock?.mediaVideo as VideoFields_mediaVideo_Video)
                ?.title?.[0]?.value ?? ''
          }}
          Icon={VideoOnIcon}
        />
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Typography
          variant="subtitle2"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          color="text.secondary"
        >
          {
            (selectedBlock?.mediaVideo as VideoFields_mediaVideo_Video)
              ?.title?.[0]?.value
          }
        </Typography>
        <Typography
          variant="caption"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
          color="text.secondary"
        >
          {language}
          &nbsp;
        </Typography>
      </Box>
      <IconButton disabled sx={{ mr: 2 }}>
        <Edit2Icon color="primary" />
      </IconButton>
    </>
  )
}
