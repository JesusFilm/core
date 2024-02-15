import Grid from '@mui/material/Grid'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'

import { NewButtonButton } from './NewButtonButton'
import { NewFormButton } from './NewFormButton'
import { NewImageButton } from './NewImageButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSignUpButton } from './NewSignUpButton'
import { NewTextResponseButton } from './NewTextResponseButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewVideoButton } from './NewVideoButton'

export function AddBlock(): ReactElement {
  const { formiumForm } = useFlags()
  const {
    state: { selectedStep }
  } = useEditor()

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const hasChildBlock = cardBlock?.children?.some(
    (block) => block.id !== cardBlock.coverBlockId
  )

  return (
    <>
      <Grid p={5} container spacing={4}>
        <Grid item xs={6} sm={12}>
          <NewTypographyButton />
        </Grid>
        <Grid item xs={6} sm={12}>
          <NewImageButton />
        </Grid>
        <Grid item xs={6} sm={12}>
          <NewVideoButton disabled={hasChildBlock} />
        </Grid>
        <Grid item xs={6} sm={12}>
          <NewRadioQuestionButton />
        </Grid>
        <Grid item xs={6} sm={12}>
          <NewTextResponseButton />
        </Grid>
        <Grid item xs={6} sm={12}>
          <NewSignUpButton />
        </Grid>
        <Grid item xs={6} sm={12}>
          <NewButtonButton />
        </Grid>
        {formiumForm && (
          <Grid item xs={6} sm={12}>
            <NewFormButton />
          </Grid>
        )}
      </Grid>
    </>
  )
}
