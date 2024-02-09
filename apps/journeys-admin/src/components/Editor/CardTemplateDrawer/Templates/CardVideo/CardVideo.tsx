import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Image from 'next/image'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import {
  CardVideoCreate,
  CardVideoCreateVariables
} from '../../../../../../__generated__/CardVideoCreate'
import {
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../__generated__/globalTypes'

import cardVideoImage from './cardVideo.svg'

export const CARD_VIDEO_CREATE = gql`
  ${TYPOGRAPHY_FIELDS}
  ${VIDEO_FIELDS}
  mutation CardVideoCreate(
    $titleInput: TypographyBlockCreateInput!
    $videoInput: VideoBlockCreateInput!
  ) {
    title: typographyBlockCreate(input: $titleInput) {
      ...TypographyFields
    }
    video: videoBlockCreate(input: $videoInput) {
      ...VideoFields
    }
  }
`

interface CardVideoProps {
  onClick: () => void
}

export function CardVideo({ onClick }: CardVideoProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardVideoCreate] = useMutation<
    CardVideoCreate,
    CardVideoCreateVariables
  >(CARD_VIDEO_CREATE)

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return
    await cardVideoCreate({
      variables: {
        titleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t("Jesus: History's Most Influential Figure?"),
          variant: TypographyVariant.h1
        },
        videoInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          videoId: '1_jf-0-0',
          videoVariantLanguageId: '529',
          startAt: 2048,
          endAt: 2058,
          autoplay: true,
          muted: false,
          source: VideoBlockSource.internal
        }
      },
      update(cache, { data }) {
        if (data != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const NEW_BLOCK_FRAGMENT = gql`
                  fragment NewBlock on Block {
                    id
                  }
                `
                return [
                  ...existingBlockRefs,
                  cache.writeFragment({
                    data: data.title,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.video,
                    fragment: NEW_BLOCK_FRAGMENT
                  })
                ]
              }
            }
          })
        }
      }
    })
    onClick()
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <ButtonBase sx={{ borderRadius: 5 }} onClick={handleClick}>
        <Image
          width={128}
          height={195}
          src={cardVideoImage}
          alt="Card Video Template"
        />
      </ButtonBase>
    </Box>
  )
}
