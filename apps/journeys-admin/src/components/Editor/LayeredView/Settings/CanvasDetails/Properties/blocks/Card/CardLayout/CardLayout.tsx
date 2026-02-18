import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  CardBlockLayoutUpdate,
  CardBlockLayoutUpdateVariables
} from '../../../../../../../../../../__generated__/CardBlockLayoutUpdate'
import { HorizontalSelect } from '../../../../../../../../HorizontalSelect'

import cardLayoutContained from './assets/card-layout-contained.svg'
import cardLayoutExpanded from './assets/card-layout-expanded.svg'

export const CARD_BLOCK_LAYOUT_UPDATE = gql`
  mutation CardBlockLayoutUpdate($id: ID!, $input: CardBlockUpdateInput!) {
    cardBlockUpdate(id: $id, input: $input) {
      id
      fullscreen
    }
  }
`

interface CardLayoutProps {
  disableExpanded?: boolean
}

export function CardLayout({
  disableExpanded = false
}: CardLayoutProps): ReactElement {
  const { t } = useTranslation()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const [cardBlockUpdate] = useMutation<
    CardBlockLayoutUpdate,
    CardBlockLayoutUpdateVariables
  >(CARD_BLOCK_LAYOUT_UPDATE)

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock> | undefined

  function handleLayoutChange(fullscreen: boolean): void {
    if (cardBlock == null) return
    if (disableExpanded && fullscreen) return

    add({
      parameters: {
        execute: {
          fullscreen
        },
        undo: {
          fullscreen: !fullscreen
        }
      },
      execute({ fullscreen }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep
        })
        void cardBlockUpdate({
          variables: {
            id: cardBlock.id,
            input: {
              fullscreen
            }
          },
          optimisticResponse: {
            cardBlockUpdate: {
              id: cardBlock.id,
              __typename: 'CardBlock',
              fullscreen
            }
          }
        })
      }
    })
  }

  const selectedLayoutId = disableExpanded
    ? 'false'
    : cardBlock?.fullscreen.toString()

  return (
    <>
      <Box>
        <HorizontalSelect
          onChange={(val) => handleLayoutChange(val === 'true')}
          id={selectedLayoutId}
          sx={{ px: 4, pb: 4, pt: 1 }}
        >
          <Box
            sx={{
              display: 'flex',
              ...(disableExpanded && {
                opacity: 0.3,
                filter: 'grayscale(100%)'
              })
            }}
            id="true"
            key="true"
            data-testid={cardBlock?.fullscreen === true ? 'selected' : 'true'}
            aria-disabled={disableExpanded}
          >
            <Tooltip
              title={
                disableExpanded
                  ? t('Not available when card contains a video')
                  : ''
              }
              disableHoverListener={!disableExpanded}
            >
              <Image
                src={cardLayoutExpanded}
                alt="Expanded"
                width={89}
                height={137}
                style={{
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </Tooltip>
          </Box>
          <Box
            sx={{ display: 'flex' }}
            id="false"
            key="false"
            data-testid={cardBlock?.fullscreen !== true ? 'selected' : 'false'}
          >
            <Image
              src={cardLayoutContained}
              alt="Contained"
              width={89}
              height={137}
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
        </HorizontalSelect>
      </Box>
    </>
  )
}
