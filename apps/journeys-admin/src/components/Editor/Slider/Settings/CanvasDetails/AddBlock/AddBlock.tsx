import Grid from '@mui/material/GridLegacy'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import type { BlockFields_CardBlock as CardBlock } from '../../../../../../../__generated__/BlockFields'
import { DrawerTitle } from '../../Drawer'

import { NewButtonButton } from './NewButtonButton'
import { NewImageButton } from './NewImageButton'
import { NewMultiselectButton } from './NewMultiselectButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSpacerButton } from './NewSpacerButton'
import { NewTextResponseButton } from './NewTextResponseButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewVideoButton } from './NewVideoButton'

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
        borderRadius: 3,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden'
      }}
      border={1}
      borderColor="divider"
      data-testid="SettingsDrawer"
    >
      <DrawerTitle title={t('Add a block')} onClose={onClose} />
      <Grid p={5} container spacing={4}>
        <Grid item xs={6} md={12}>
          <NewTypographyButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewImageButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewVideoButton disabled={hasChildBlock} />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewRadioQuestionButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewMultiselectButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewTextResponseButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewButtonButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewSpacerButton />
        </Grid>
      </Grid>
    </Stack>
  )
}
