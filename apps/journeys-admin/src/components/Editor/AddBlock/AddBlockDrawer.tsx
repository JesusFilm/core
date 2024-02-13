import { ReactElement } from 'react'

import Stack from '@mui/material/Stack'

import { NewTypographyButton } from '../Canvas/Button/NewTypographyButton'
import { NewImageButton } from '../Canvas/Button/NewImageButton'
import { NewVideoButton } from '../Canvas/Button/NewVideoButton'
import { NewRadioQuestionButton } from '../Canvas/Button/NewRadioQuestionButton'
import { NewTextResponseButton } from '../Canvas/Button/NewTextResponseButton'
import { NewSignUpButton } from '../Canvas/Button/NewSignUpButton'
import { NewButtonButton } from '../Canvas/Button/NewButtonButton'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { NewFormButton } from '../Canvas/Button/NewFormButton'
import { Grid, useMediaQuery } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '@core/journeys/ui/block'

export function AddBlock(): ReactElement {
  const { formiumForm } = useFlags()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: { selectedStep }
  } = useEditor()

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const hasVideoBlock =
    cardBlock?.children?.find(
      (block) =>
        block.__typename === 'VideoBlock' && cardBlock.coverBlockId !== block.id
    ) != null

  const hasChildBlock = cardBlock?.children?.some(
    (block) => block.id !== cardBlock.coverBlockId
  )

  return (
    <>
      {smUp ? (
        <Stack gap={4} mt={6} px={5}>
          <NewTypographyButton disabled={hasVideoBlock} />
          <NewImageButton disabled={hasVideoBlock} />
          <NewVideoButton disabled={hasChildBlock} />
          <NewRadioQuestionButton disabled={hasVideoBlock} />
          <NewTextResponseButton disabled={hasVideoBlock} />
          <NewSignUpButton disabled={hasVideoBlock} />
          <NewButtonButton disabled={hasVideoBlock} />
          {formiumForm && <NewFormButton disabled={hasVideoBlock} />}
        </Stack>
      ) : (
        <Grid p={5} container spacing={4}>
          <Grid item xs={6}>
            <NewTypographyButton disabled={hasVideoBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewImageButton disabled={hasVideoBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewVideoButton disabled={hasChildBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewRadioQuestionButton disabled={hasVideoBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewTextResponseButton disabled={hasVideoBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewSignUpButton disabled={hasVideoBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewButtonButton disabled={hasVideoBlock} />
          </Grid>
          <Grid item xs={6}>
            {formiumForm && <NewFormButton disabled={hasVideoBlock} />}
          </Grid>
        </Grid>
      )}
    </>
  )
}
