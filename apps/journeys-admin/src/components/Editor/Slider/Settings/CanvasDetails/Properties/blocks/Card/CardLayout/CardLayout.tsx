import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  CardBlockLayoutUpdate,
  CardBlockLayoutUpdateVariables
} from '../../../../../../../../../../__generated__/CardBlockLayoutUpdate'
import { HorizontalSelect } from '../../../../../../../../HorizontalSelect'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import cardLayoutContained from './assets/card-layout-contained.svg'
import cardLayoutExpanded from './assets/card-layout-expanded.svg'

export const CARD_BLOCK_LAYOUT_UPDATE = gql`
  mutation CardBlockLayoutUpdate(
    $id: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, input: $input) {
      id
      fullscreen
    }
  }
`

export function CardLayout(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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

  async function handleLayoutChange(fullscreen: boolean): Promise<void> {
    if (cardBlock == null) return
    await add({
      parameters: {
        execute: {
          fullscreen
        },
        undo: {
          fullscreen: !fullscreen
        }
      },
      execute: async ({ fullscreen }) => {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep: selectedStep
        })
        await cardBlockUpdate({
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
      <Box sx={{ p: 4, display: { xs: 'flex', sm: 'none' } }}>
        <Stack spacing={3} direction="row">
          <Box
            sx={{
              backgroundColor: '#EFEFEF',
              width: 58,
              height: 58,
              borderRadius: 2,
              paddingTop: 3,
              textAlign: 'center'
            }}
          >
            <FlexAlignBottom1Icon fontSize="large" />
          </Box>
          <Stack direction="column" justifyContent="center">
            <Typography variant="subtitle2">
              {cardBlock?.fullscreen ?? false ? t('Expanded') : t('Contained')}
            </Typography>
            <Typography variant="caption">{t('Card Layout')}</Typography>
          </Stack>
        </Stack>
      </Box>
      <Divider sx={{ mb: 4, display: { xs: 'flex', sm: 'none' } }} />
      <Box>
        <HorizontalSelect
          onChange={async (val) => await handleLayoutChange(val === 'true')}
          id={cardBlock?.fullscreen.toString()}
          sx={{ px: 4, pb: 4, pt: 1 }}
        >
          <Box sx={{ display: 'flex' }} id="true" key="true" data-testid="true">
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
            data-testid="false"
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
