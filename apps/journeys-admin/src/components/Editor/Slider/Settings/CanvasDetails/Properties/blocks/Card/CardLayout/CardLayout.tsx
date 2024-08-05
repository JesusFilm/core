import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Image from 'next/image'
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

export function CardLayout(): ReactElement {
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

  return (
    <>
      <Box>
        <HorizontalSelect
          onChange={(val) => handleLayoutChange(val === 'true')}
          id={cardBlock?.fullscreen.toString()}
          sx={{ px: 4, pb: 4, pt: 1 }}
        >
          <Box
            sx={{ display: 'flex' }}
            id="true"
            key="true"
            data-testid={cardBlock?.fullscreen === true ? 'selected' : 'true'}
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
