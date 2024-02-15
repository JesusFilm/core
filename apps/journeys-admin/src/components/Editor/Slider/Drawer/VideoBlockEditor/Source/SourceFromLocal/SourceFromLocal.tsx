import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
import { GetVideoVariantLanguages } from '../../../../../../__generated__/GetVideoVariantLanguages'
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
  const { data } = useQuery<GetVideoVariantLanguages>(
    GET_VIDEO_VARIANT_LANGUAGES,
    {
      variables: {
        id: selectedBlock?.video?.id
      },
      skip: selectedBlock?.video?.id == null
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
      language = `${language} (${nativeLanguage})`
    setLanguage(language)
  }, [data?.video?.variantLanguages, selectedBlock?.videoVariantLanguageId])

  return (
    <>
      <Box>
        <ImageBlockThumbnail
          selectedBlock={{
            src: selectedBlock?.video?.image ?? '',
            alt: selectedBlock?.video?.title?.[0]?.value ?? ''
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
        >
          {selectedBlock?.video?.title?.[0]?.value}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {language}
          &nbsp;
        </Typography>
      </Box>
      <Edit2Icon color="primary" />
    </>
  )
}
