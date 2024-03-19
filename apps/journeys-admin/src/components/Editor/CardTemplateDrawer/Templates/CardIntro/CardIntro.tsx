import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import {
  CardIntroCreate,
  CardIntroCreateVariables
} from '../../../../../../__generated__/CardIntroCreate'
import {
  ButtonVariant,
  IconName,
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../__generated__/globalTypes'

import cardIntroImage from './cardIntro.svg'

export const CARD_INTRO_CREATE = gql`
  ${TYPOGRAPHY_FIELDS}
  ${BUTTON_FIELDS}
  ${VIDEO_FIELDS}
  ${ICON_FIELDS}
  mutation CardIntroCreate(
    $journeyId: ID!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $bodyInput: TypographyBlockCreateInput!
    $buttonInput: ButtonBlockCreateInput!
    $buttonId: ID!
    $buttonUpdateInput: ButtonBlockUpdateInput!
    $startIconInput: IconBlockCreateInput!
    $endIconInput: IconBlockCreateInput!
    $videoInput: VideoBlockCreateInput!
  ) {
    subtitle: typographyBlockCreate(input: $subtitleInput) {
      ...TypographyFields
    }
    title: typographyBlockCreate(input: $titleInput) {
      ...TypographyFields
    }
    body: typographyBlockCreate(input: $bodyInput) {
      ...TypographyFields
    }
    button: buttonBlockCreate(input: $buttonInput) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $startIconInput) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $endIconInput) {
      ...IconFields
    }
    buttonBlockUpdate(
      id: $buttonId
      journeyId: $journeyId
      input: $buttonUpdateInput
    ) {
      ...ButtonFields
    }
    video: videoBlockCreate(input: $videoInput) {
      ...VideoFields
    }
  }
`

interface CardIntroProps {
  onClick: () => void
}

export function CardIntro({ onClick }: CardIntroProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardIntroCreate] = useMutation<
    CardIntroCreate,
    CardIntroCreateVariables
  >(CARD_INTRO_CREATE)

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return
    const buttonId = uuidv4()
    const startIconId = uuidv4()
    const endIconId = uuidv4()
    await cardIntroCreate({
      variables: {
        journeyId: journey.id,
        buttonId,
        subtitleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t('Interactive Video'),
          variant: TypographyVariant.h6
        },
        titleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t("Jesus: History's Most Influential Figure?"),
          variant: TypographyVariant.h1
        },
        bodyInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t(
            'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.'
          ),
          variant: TypographyVariant.body1
        },
        buttonInput: {
          id: buttonId,
          journeyId: journey.id,
          parentBlockId: cardId,
          label: t('Begin the Journey'),
          variant: ButtonVariant.contained
        },
        startIconInput: {
          id: startIconId,
          journeyId: journey.id,
          parentBlockId: buttonId
        },
        endIconInput: {
          id: endIconId,
          journeyId: journey.id,
          parentBlockId: buttonId,
          name: IconName.ArrowForwardRounded
        },
        buttonUpdateInput: {
          startIconId,
          endIconId
        },
        videoInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          videoId: '1_jf-0-0',
          videoVariantLanguageId: '529',
          startAt: 2048,
          endAt: 2058,
          isCover: true,
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
                    data: data.subtitle,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.title,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.body,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.buttonBlockUpdate,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.startIcon,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.endIcon,
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
          cache.modify({
            id: cache.identify({
              __typename: 'CardBlock',
              id: cardId
            }),
            fields: {
              coverBlockId: () => data.video.id
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
          src={cardIntroImage}
          alt="Card Intro Template"
        />
      </ButtonBase>
    </Box>
  )
}
