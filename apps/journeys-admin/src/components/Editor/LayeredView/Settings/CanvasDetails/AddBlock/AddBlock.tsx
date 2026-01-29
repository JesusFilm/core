import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import type { BlockFields_CardBlock as CardBlock } from '../../../../../../../__generated__/BlockFields'
import { Drawer, DrawerTitle } from '../../Drawer'
import { Paper } from '@mui/material'

import { NewButtonButton } from './NewButtonButton'
import { NewImageButton } from './NewImageButton'
import { NewMultiselectButton } from './NewMultiselectButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSpacerButton } from './NewSpacerButton'
import { NewTextResponseButton } from './NewTextResponseButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewVideoButton } from './NewVideoButton'
import { DRAWER_WIDTH } from '../../../../constants'
import Stack from '@mui/material/Stack'

export function AddBlock(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const hasChildBlock =
    cardBlock?.children != null && cardBlock?.children?.length > 0

  function onClose(): void {
    dispatch({
      type: 'SetActiveCanvasDetailsDrawerAction',
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
    })
  }

  return (
    <Stack
      component={Paper}
      elevation={0}
      sx={{
        height: '100%',
        width: DRAWER_WIDTH,
        borderRadius: 3,
        // borderBottomLeftRadius: 0,
        // borderBottomRightRadius: 0,
        overflow: 'hidden'
      }}
      border={1}
      borderColor="divider"
      data-testid="SettingsDrawer"
    >
      <DrawerTitle title={t('Add a block')} onClose={onClose} />
      <Stack
        p={5}
        spacing={4}
        direction={{ xs: 'row', md: 'column' }}
        sx={{
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          '& > *': {
            flex: { xs: '1 1 calc(50% - 16px)', md: '0 0 auto' },
            minWidth: { xs: 'calc(50% - 16px)', md: 'auto' }
          }
        }}
      >
        <NewTypographyButton />
        <NewImageButton />
        <NewVideoButton disabled={hasChildBlock} />
        <NewRadioQuestionButton />
        <NewMultiselectButton />
        <NewTextResponseButton />
        <NewButtonButton />
        <NewSpacerButton />
      </Stack>
    </Stack>
  )
}
