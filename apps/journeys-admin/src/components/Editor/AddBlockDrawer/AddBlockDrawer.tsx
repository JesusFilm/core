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

export interface AddBlockDrawerProps {
  hasVideo: boolean
  hasBlock: boolean
}

export function AddBlockDrawer({
  hasVideo,
  hasBlock
}: AddBlockDrawerProps): ReactElement {
  const { formiumForm } = useFlags()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      {smUp ? (
        <Stack gap={4} mt={6} px={5}>
          <NewTypographyButton disabled={hasVideo} />
          <NewImageButton disabled={hasVideo} />
          <NewVideoButton disabled={hasBlock} />
          <NewRadioQuestionButton disabled={hasVideo} />
          <NewTextResponseButton disabled={hasVideo} />
          <NewSignUpButton disabled={hasVideo} />
          <NewButtonButton disabled={hasVideo} />
          {formiumForm && <NewFormButton disabled={hasVideo} />}
        </Stack>
      ) : (
        <Grid p={5} container spacing={4}>
          <Grid item xs={6}>
            <NewTypographyButton disabled={hasVideo} />
          </Grid>
          <Grid item xs={6}>
            <NewImageButton disabled={hasVideo} />
          </Grid>
          <Grid item xs={6}>
            <NewVideoButton disabled={hasBlock} />
          </Grid>
          <Grid item xs={6}>
            <NewRadioQuestionButton disabled={hasVideo} />
          </Grid>
          <Grid item xs={6}>
            <NewTextResponseButton disabled={hasVideo} />
          </Grid>
          <Grid item xs={6}>
            <NewSignUpButton disabled={hasVideo} />
          </Grid>
          <Grid item xs={6}>
            <NewButtonButton disabled={hasVideo} />
          </Grid>
          <Grid item xs={6}>
            {formiumForm && <NewFormButton disabled={hasVideo} />}
          </Grid>
        </Grid>
      )}
    </>
  )
}
