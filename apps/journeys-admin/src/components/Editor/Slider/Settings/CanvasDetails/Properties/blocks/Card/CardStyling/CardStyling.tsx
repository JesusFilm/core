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
import PaletteIcon from '@core/shared/ui/icons/Palette'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { CardBlockThemeModeUpdate } from '../../../../../../../../../../__generated__/CardBlockThemeModeUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { HorizontalSelect } from '../../../../../../../../HorizontalSelect'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import cardStyleDark from './assets/card-style-dark.svg'
import cardStyleLight from './assets/card-style-light.svg'

export const CARD_BLOCK_THEME_MODE_UPDATE = gql`
  mutation CardBlockThemeModeUpdate(
    $id: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, input: $input) {
      id
      themeMode
      themeName
    }
  }
`

export function CardStyling(): ReactElement {
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock>

  const [cardBlockUpdate] = useMutation<CardBlockThemeModeUpdate>(
    CARD_BLOCK_THEME_MODE_UPDATE
  )
  const { t } = useTranslation('apps-journeys-admin')

  const handleChange = async (themeMode: ThemeMode): Promise<void> => {
    if (cardBlock != null) {
      await add({
        parameters: {
          execute: {
            cardBlockId: cardBlock.id,
            themeMode,
            selectedStep
          },
          undo: {
            cardBlockId: cardBlock.id,
            themeMode:
              themeMode === ThemeMode.dark ? ThemeMode.light : ThemeMode.dark,
            selectedStep
          }
        },
        async execute({ cardBlockId: id, themeMode }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStep
          })
          await cardBlockUpdate({
            variables: {
              id,
              input: {
                themeMode,
                themeName: ThemeName.base
              }
            },
            optimisticResponse: {
              cardBlockUpdate: {
                id: cardBlock.id,
                __typename: 'CardBlock',
                themeMode,
                themeName: ThemeName.base
              }
            }
          })
        }
      })
    }
  }

  return (
    <>
      <Box sx={{ p: 4, display: { xs: 'flex', sm: 'none' } }}>
        <Stack spacing={4} direction="row">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.default',
              color: 'text.secondary',
              width: 58,
              height: 58,
              borderRadius: 2
            }}
          >
            <PaletteIcon fontSize="large" />
          </Box>
          <Stack direction="column" justifyContent="center">
            <Typography variant="subtitle2">
              {cardBlock?.themeMode == null && t('Default')}
              {cardBlock?.themeMode === ThemeMode.light && t('Light')}
              {cardBlock?.themeMode === ThemeMode.dark && t('Dark')}
            </Typography>
            <Typography variant="caption">{t('Card Style')}</Typography>
          </Stack>
        </Stack>
      </Box>
      <Divider sx={{ mb: 4, display: { xs: 'flex', sm: 'none' } }} />
      <Box>
        <HorizontalSelect
          onChange={handleChange}
          id={cardBlock?.themeMode ?? undefined}
          sx={{ px: 4, pb: 4, pt: 1 }}
        >
          <Box
            id={ThemeMode.light}
            sx={{ display: 'flex' }}
            data-testid="Light"
          >
            <Image
              src={cardStyleLight}
              alt="Light"
              width={89}
              height={134}
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
          <Box id={ThemeMode.dark} sx={{ display: 'flex' }} data-testid="Dark">
            <Image
              src={cardStyleDark}
              alt="Dark"
              width={89}
              height={134}
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
