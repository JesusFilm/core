import {
  Box,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  SvgIcon,
  Typography
} from '@mui/material'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import React, { ReactElement, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'
import Ellipsis from '@core/shared/ui/icons/Ellipsis'
import Grid1 from '@core/shared/ui/icons/Grid1'
import Home3 from '@core/shared/ui/icons/Home3'
import Home4 from '@core/shared/ui/icons/Home4'
import Menu1 from '@core/shared/ui/icons/Menu1'
import More from '@core/shared/ui/icons/More'

import {
  BlockFields_CardBlock,
  BlockFields_StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import {
  JourneyMenuButtonIcon,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
// import {
//   BlockFields_CardBlock as CardBlock,
//   BlockFields_StepBlock as StepBlock
// } from '../../../../../../../__generated__/BlockFields'

import { useJourneyUpdateMutation } from '../../../../../../../libs/useJourneyUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../../../../libs/useStepAndCardBlockCreateMutation'
import { useCreateStep } from '../../../../JourneyFlow/libs/useCreateStep'
import { Accordion } from '../../Properties/Accordion'

type IconOptions = Array<{
  Icon: typeof SvgIcon
  label: string
  value: JourneyMenuButtonIcon
}>

const Icons: IconOptions = [
  {
    Icon: ChevronDown,
    label: 'Chevron down',
    value: JourneyMenuButtonIcon.chevronDown
  },
  {
    Icon: Ellipsis,
    label: 'Ellipsis',
    value: JourneyMenuButtonIcon.ellipsis
  },
  // MENU-TODO: change this to correct icon
  {
    Icon: Menu1,
    label: 'Equals',
    value: JourneyMenuButtonIcon.equals
  },
  {
    Icon: Grid1,
    label: 'Grid 1',
    value: JourneyMenuButtonIcon.grid1
  },
  {
    Icon: Home3,
    label: 'Home 3',
    value: JourneyMenuButtonIcon.home3
  },
  {
    Icon: Home4,
    label: 'Home 4',
    value: JourneyMenuButtonIcon.home4
  },
  {
    Icon: Menu1,
    label: 'Menu 1',
    value: JourneyMenuButtonIcon.menu1
  },
  {
    Icon: More,
    label: 'More',
    value: JourneyMenuButtonIcon.more
  }
]

function IconSelect(): ReactElement {
  const { journey } = useJourney()
  const { add } = useCommand()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { t } = useTranslation('apps-journeys-admin')

  function iconUpdate(icon: JourneyMenuButtonIcon | null): void {
    if (journey == null) return

    const undoIcon = journey.menuButtonIcon
    add({
      parameters: {
        execute: { icon },
        undo: { icon: undoIcon }
      },
      execute({ icon }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: {
              menuButtonIcon: icon
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              tags: [],
              menuButtonIcon: icon
            }
          }
        })
      }
    })
  }

  function handleChange(event: SelectChangeEvent): void {
    const newName = event.target.value as JourneyMenuButtonIcon
    if (event.target.value === '') {
      iconUpdate(null)
    } else if (newName !== journey?.menuButtonIcon) {
      iconUpdate(newName)
    }
  }
  return (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      <Typography variant="subtitle2" sx={{ color: 'secondary.light' }}>
        {t('Select Icon')}
      </Typography>
      <Select
        value={journey?.menuButtonIcon ?? ''}
        onChange={handleChange}
        displayEmpty
        autoWidth
        sx={{
          width: 'min-content',
          borderRadius: 2
        }}
      >
        <MenuItem value="" key="empty">
          <Box
            sx={{
              height: 48,
              width: 48,
              borderRadius: 2,
              boxSizing: 'border-box',
              border: '3px dashed #f1f1f1',
              display: 'grid',
              placeItems: 'center'
            }}
          />
        </MenuItem>
        {Icons.map(({ Icon, value }) => (
          <MenuItem value={value} key={value}>
            <Box
              sx={{
                height: 48,
                width: 48,
                borderRadius: 2,
                background: '#f1f1f1',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Icon />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Stack>
  )
}

function MenuCardCTA(): ReactElement {
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

      void journeyUpdate({
        variables: {
          id: journey.id,
          input: {
            menuStepBlockId: stepId
          }
        },
        optimisticResponse: {
          journeyUpdate: {
            ...journey,
            menuStepBlockId: stepId
          }
        }
      })
    }
  }

  const handleClick = async (): Promise<void> => {
    if (journey == null) return

    if (journey.menuStepBlock == null) {
      await createMenuBlock()
    }

    if (journey.menuStepBlockId != null) {
      dispatch({
        type: 'SetSelectedStepByIdAction',
        selectedStepId: journey.menuStepBlockId
      })
    }
  }

  return (
    <Button
      variant="outlined"
      fullWidth
      endIcon={<ChevronRight />}
      onClick={handleClick}
    >
      {menuExists ? t('Edit Menu Card') : t('Create Menu Card')}
    </Button>
  )
}

export function Menu(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Accordion id="menu" icon={<Menu1 />} name={t('Menu')}>
      <Stack sx={{ p: 4, pt: 2 }} spacing={4} data-testid="Menu">
        <IconSelect />
        <MenuCardCTA />
      </Stack>
    </Accordion>
  )
}
