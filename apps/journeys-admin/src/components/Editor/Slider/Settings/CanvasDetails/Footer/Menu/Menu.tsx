import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'
import Menu1 from '@core/shared/ui/icons/Menu1'

import {
  BlockFields_CardBlock,
  BlockFields_StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { useJourneyUpdateMutation } from '../../../../../../../libs/useJourneyUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../../../../libs/useStepAndCardBlockCreateMutation'
import { Accordion } from '../../Properties/Accordion'

import { ActionButton } from './ActionButton'
import { IconSelect } from './IconSelect'

export function Menu(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()
  const { dispatch } = useEditor()

  const menuExists = journey?.menuStepBlockId != null

  const createMenuBlock = async (): Promise<void> => {
    if (journey == null) return

    const x = 0
    const y = 144

    const stepId = uuidv4()

    const step: BlockFields_StepBlock & { x: number; y: number } = {
      __typename: 'StepBlock',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0,
      id: stepId,
      x,
      y,
      slug: 'menu'
    }
    const card: BlockFields_CardBlock = {
      __typename: 'CardBlock',
      id: uuidv4(),
      parentBlockId: step.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      coverBlockId: null,
      backgroundColor: null,
      parentOrder: 0
    }

    if (journey.menuStepBlockId == null) {
      const { data } = await stepAndCardBlockCreate({
        variables: {
          stepBlockCreateInput: {
            id: step.id,
            journeyId: journey.id,
            x,
            y
          },
          cardBlockCreateInput: {
            id: card.id,
            journeyId: journey.id,
            parentBlockId: step.id,
            themeMode: ThemeMode.dark,
            themeName: ThemeName.base
          }
        },
        optimisticResponse: {
          stepBlockCreate: step,
          cardBlockCreate: card
        }
      })

      if (data != null) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: {
              menuStepBlockId: data.stepBlockCreate.id
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              menuStepBlockId: data.stepBlockCreate.id
            }
          }
        })
      }
    }
  }

  const handleClick = async (): Promise<void> => {
    if (journey == null) return

    if (journey.menuStepBlockId == null) {
      await createMenuBlock()
    } else {
      dispatch({
        type: 'SetSelectedStepByIdAction',
        selectedStepId: journey.menuStepBlockId
      })
    }
  }

  return (
    <Accordion id="menu" icon={<Menu1 />} name={t('Menu')}>
      <Stack sx={{ p: 4, pt: 2 }} spacing={4} data-testid="Menu">
        <IconSelect />
        <ActionButton
          label={menuExists ? t('Edit Menu Card') : t('Create Menu Card')}
          handleClick={handleClick}
          endIcon={<ChevronRight />}
        />
      </Stack>
    </Accordion>
  )
}
