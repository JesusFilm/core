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
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonSize,
  ButtonVariant,
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { useMenuBlockCreateMutation } from '../../../../../../../../libs/useMenuBlockCreateMutation/useMenuBlockCreateMutation'
import {
  removeCachedBlocks,
  useMenuBlockDeleteMutation
} from '../../../../../../../../libs/useMenuBlockDeleteMutation/useMenuBlockDeleteMutation'
import { useMenuBlockRestoreMutation } from '../../../../../../../../libs/useMenuBlockRestoreMutation/useMenuBlockRestoreMutation'
import { setBlockRestoreEditorState } from '../../../../../../utils/useBlockDeleteCommand'
import { MENU_BLOCK_X, MENU_BLOCK_Y } from '../constants'

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

    const step: TreeBlock<StepBlock & { x: number; y: number }> = {
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

    const card = {
      __typename: 'CardBlock',
      id: cardId,
      parentBlockId: step.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      backdropBlur: null,
      coverBlockId: null,
      backgroundColor: null,
      parentOrder: 0
    } satisfies CardBlock

    const heading = {
      __typename: 'TypographyBlock' as const,
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      color: null,
      content: t('Menu'),
      variant: TypographyVariant.h1,
      align: TypographyAlign.center
    } satisfies TypographyBlock

    const subHeading = {
      __typename: 'TypographyBlock' as const,
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 1,
      color: null,
      content: t('Helping people discover Jesus.'),
      variant: TypographyVariant.subtitle2,
      align: TypographyAlign.center
    } satisfies TypographyBlock

    const button1 = {
      __typename: 'ButtonBlock',
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 2,
      label: t('About Us'),
      buttonVariant: ButtonVariant.contained,
      buttonColor: null,
      size: ButtonSize.large,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null
    } satisfies ButtonBlock

    const button2 = {
      __typename: 'ButtonBlock',
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 3,
      label: t('Ministries'),
      buttonVariant: ButtonVariant.contained,
      buttonColor: null,
      size: ButtonSize.large,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null
    } satisfies ButtonBlock

    const button3 = {
      __typename: 'ButtonBlock' as const,
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 4,
      label: t('Contact Us'),
      buttonVariant: ButtonVariant.contained,
      buttonColor: null,
      size: ButtonSize.large,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null
    } satisfies ButtonBlock

    const createdBlocks = [
      step,
      card,
      heading,
      subHeading,
      button1,
      button2,
      button3
    ]

    if (journey.menuStepBlock == null) {
      add({
        parameters: { execute: {}, undo: {} },
        execute() {
          void menuBlockCreate({
            variables: {
              journeyId: journey.id,
              stepInput: {
                id: step.id,
                journeyId: journey.id,
                x: step.x,
                y: step.y
              },
              cardInput: {
                id: card.id,
                journeyId: journey.id,
                parentBlockId: step.id,
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base
              },
              headingInput: {
                id: heading.id,
                journeyId: journey.id,
                parentBlockId: heading.parentBlockId,
                content: heading.content,
                variant: heading.variant,
                align: heading.align
              },
              subHeadingInput: {
                id: subHeading.id,
                journeyId: journey.id,
                parentBlockId: subHeading.parentBlockId,
                content: subHeading.content,
                variant: subHeading.variant,
                align: subHeading.align
              },
              button1Input: {
                id: button1.id,
                journeyId: journey.id,
                parentBlockId: button1.parentBlockId,
                label: button1.label,
                size: button1.size,
                variant: button1.buttonVariant
              },
              button2Input: {
                id: button2.id,
                journeyId: journey.id,
                parentBlockId: button2.parentBlockId,
                label: button2.label,
                size: button2.size,
                variant: button2.buttonVariant
              },
              button3Input: {
                id: button3.id,
                journeyId: journey.id,
                parentBlockId: button3.parentBlockId,
                label: button3.label,
                size: button3.size,
                variant: button3.buttonVariant
              },
              journeyUpdateInput: {
                menuStepBlockId: step.id
              }
            },
            optimisticResponse: {
              step,
              card,
              heading,
              subHeading,
              button1,
              button2,
              button3,
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
              journeyUpdateInput: {
                menuStepBlockId: stepId
              }
            },
            optimisticResponse: {
              stepRestore: [step],
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
