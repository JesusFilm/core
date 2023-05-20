import { ReactElement, useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import type { TreeBlock } from '@core/journeys/ui/block'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { GetVideoVariantLanguages } from '../../../../../../__generated__/GetVideoVariantLanguages'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
import { ContainedIconButton } from '../../../../ContainedIconButton'

export const GET_VIDEO_VARIANT_LANGUAGES = gql`
  query GetVideoVariantLanguages($id: ID!) {
    video(id: $id) {
      id
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
  onClick: () => void
}

export function SourceFromLocal({
  selectedBlock,
  onClick
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
      <ContainedIconButton
        onClick={onClick}
        imageSrc={selectedBlock?.video?.image ?? ''}
        imageAlt={selectedBlock?.video?.title?.[0]?.value ?? ''}
        label={selectedBlock?.video?.title?.[0]?.value ?? ''}
        description={language}
        actionIcon={<EditRoundedIcon color="primary" />}
      />
    </>
  )
}
