import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { CardBlockThemeModeUpdate } from '../../../../../../../../../../__generated__/CardBlockThemeModeUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { HorizontalSelect } from '../../../../../../../../HorizontalSelect'

import cardStyleDark from './assets/card-style-dark.svg'
import cardStyleLight from './assets/card-style-light.svg'

export const CARD_BLOCK_THEME_MODE_UPDATE = gql`
  mutation CardBlockThemeModeUpdate($id: ID!, $input: CardBlockUpdateInput!) {
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

  function handleChange(themeMode: ThemeMode): void {
    if (cardBlock == null) return

    add({
      parameters: {
        execute: {
          themeMode
        },
        undo: {
          themeMode: cardBlock.themeMode
        }
      },
      execute({ themeMode }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep
        })
        void cardBlockUpdate({
          variables: {
            id: cardBlock.id,
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

  return (
    <>
      <Box>
        <HorizontalSelect
          onChange={handleChange}
          id={cardBlock?.themeMode ?? undefined}
          sx={{ px: 4, pb: 4, pt: 1 }}
        >
          <Box
            id={ThemeMode.light}
            sx={{ display: 'flex' }}
            data-testid={
              cardBlock?.themeMode === ThemeMode.light ? 'selected' : 'Light'
            }
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
          <Box
            id={ThemeMode.dark}
            sx={{ display: 'flex' }}
            data-testid={
              cardBlock?.themeMode === ThemeMode.dark ? 'selected' : 'Dark'
            }
          >
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
