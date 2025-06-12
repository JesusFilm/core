import Grid from '@mui/material/GridLegacy'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import type { BlockFields_CardBlock as CardBlock } from '../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../Drawer'

import { NewButtonButton } from './NewButtonButton'
import { NewImageButton } from './NewImageButton'
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
    <Drawer title={t('Add a block')} onClose={onClose}>
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
          <NewTextResponseButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewButtonButton />
        </Grid>
        <Grid item xs={6} md={12}>
          <NewSpacerButton />
        </Grid>
      </Grid>
    </Drawer>
  )
}
