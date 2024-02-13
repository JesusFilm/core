import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { NewButtonButton } from '../Canvas/Button/NewButtonButton'
import { NewFormButton } from '../Canvas/Button/NewFormButton'
import { NewImageButton } from '../Canvas/Button/NewImageButton'
import { NewRadioQuestionButton } from '../Canvas/Button/NewRadioQuestionButton'
import { NewSignUpButton } from '../Canvas/Button/NewSignUpButton'
import { NewTextResponseButton } from '../Canvas/Button/NewTextResponseButton'
import { NewTypographyButton } from '../Canvas/Button/NewTypographyButton'
import { NewVideoButton } from '../Canvas/Button/NewVideoButton'

export function AddBlock(): ReactElement {
  const { formiumForm } = useFlags()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
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
      {smUp ? (
        <Stack gap={4} mt={6} px={5}>
          <NewTypographyButton />
          <NewImageButton />
          <NewVideoButton disabled={hasChildBlock} />
          <NewRadioQuestionButton />
          <NewTextResponseButton />
          <NewSignUpButton />
          <NewButtonButton />
          {formiumForm && <NewFormButton />}
        </Stack>
      ) : (
        <Grid p={5} container spacing={4}>
          <Grid item xs={6}>
            <NewTypographyButton />
          </Grid>
          <Grid item xs={6}>
            <NewImageButton />
          </Grid>
          <Grid item xs={6}>
            <NewVideoButton disabled={hasChildBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewRadioQuestionButton />
          </Grid>
          <Grid item xs={6}>
            <NewTextResponseButton />
          </Grid>
          <Grid item xs={6}>
            <NewSignUpButton />
          </Grid>
          <Grid item xs={6}>
            <NewButtonButton />
          </Grid>
          <Grid item xs={6}>
            {formiumForm && <NewFormButton />}
          </Grid>
        </Grid>
      )}
    </>
  )
}
