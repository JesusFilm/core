import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

import {
  BlockFields_CardBlock,
  BlockFields_StepBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { setBlockRestoreEditorState } from '../../../../../../utils/useBlockDeleteCommand'
import { MENU_BLOCK_X, MENU_BLOCK_Y } from '../constants'

import { useMenuBlockCreateMutation } from './useMenuBlockCreateMutation/useMenuBlockCreateMutation'
import {
  removeCachedBlocks,
  useMenuBlockDeleteMutation
} from './useMenuBlockDeleteMutation/useMenuBlockDeleteMutation'
import { useMenuBlockRestoreMutation } from './useMenuBlockRestoreMutation/useMenuBlockRestoreMutation'

export function MenuActionButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { add } = useCommand()
  const [menuBlockCreate] = useMenuBlockCreateMutation()
  const [menuBlockDelete] = useMenuBlockDeleteMutation()
  const [menuBlockRestore] = useMenuBlockRestoreMutation()

  const {
    dispatch,
    state: { selectedStep, steps }
  } = useEditor()

  const menuExists = journey?.menuStepBlock != null

  const createMenuBlock = async (): Promise<string | undefined> => {
    if (journey == null) return

    const stepId = uuidv4()
    const cardId = uuidv4()

    const step: TreeBlock<BlockFields_StepBlock & { x: number; y: number }> = {
      __typename: 'StepBlock',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0,
      id: stepId,
      x: MENU_BLOCK_X,
      y: MENU_BLOCK_Y,
      slug: 'menu',
      children: []
    }
    const card: BlockFields_CardBlock = {
      __typename: 'CardBlock',
      id: cardId,
      parentBlockId: step.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      coverBlockId: null,
      backgroundColor: null,
      parentOrder: 0
    }
    const typography = {
      __typename: 'TypographyBlock' as const,
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      align: null,
      color: null,
      content: 'Menu',
      variant: TypographyVariant.h1
    }

    const createdBlocks = [step, card, typography]

    if (journey.menuStepBlock == null) {
      add({
        parameters: { execute: {}, undo: {} },
        execute() {
          void menuBlockCreate({
            variables: {
              journeyId: journey.id,
              stepBlockCreateInput: {
                id: step.id,
                journeyId: journey.id,
                x: step.x,
                y: step.y
              },
              cardBlockCreateInput: {
                id: card.id,
                journeyId: journey.id,
                parentBlockId: step.id,
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base
              },
              typographyBlockCreateInput: {
                id: typography.id,
                journeyId: journey.id,
                parentBlockId: typography.parentBlockId,
                content: typography.content,
                variant: typography.variant
              },
              journeyUpdateInput: {
                menuStepBlockId: step.id
              }
            },
            optimisticResponse: {
              step,
              card,
              typography,
              journeyUpdate: {
                ...journey,
                menuStepBlock: step
              }
            }
          })
        },
        undo() {
          if (steps != null && steps.length > 0) {
            dispatch({
              type: 'SetEditorFocusAction',
              selectedStep: steps[0],
              selectedBlock: steps[0],
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas
            })
          }

          void menuBlockDelete({
            variables: {
              journeyId: journey.id,
              stepId,
              journeyUpdateInput: {
                menuStepBlockId: null
              }
            },
            optimisticResponse: {
              stepDelete: [],
              journeyUpdate: {
                ...journey,
                menuStepBlock: null
              }
            },
            update(cache, { data }) {
              if (data == null) return
              removeCachedBlocks(cache, createdBlocks, journey?.id)
            }
          })
        },
        redo() {
          if (selectedStep != null)
            setBlockRestoreEditorState(step, selectedStep, dispatch)

          void menuBlockRestore({
            variables: {
              journeyId: journey.id,
              stepId,
              cardId,
              typographyId: typography.id,
              journeyUpdateInput: {
                menuStepBlockId: stepId
              }
            },
            optimisticResponse: {
              stepRestore: [step],
              cardRestore: [card],
              typographyRestore: [typography],
              journeyUpdate: {
                ...journey,
                menuStepBlock: step
              }
            }
          })
        }
      })

      return stepId
    }
  }

  const handleClick = async (): Promise<void> => {
    if (journey == null) return

    let menuId = journey.menuStepBlock?.id

    if (menuId == null) {
      menuId = await createMenuBlock()
    }

    dispatch({
      type: 'SetSelectedStepByIdAction',
      selectedStepId: menuId
    })
  }
  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={handleClick}
      endIcon={<ChevronRight />}
    >
      {menuExists ? t('Edit Menu Card') : t('Create Menu Card')}
    </Button>
  )
}
