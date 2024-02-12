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

export function AddBlockDrawer(): ReactElement {
  const { formiumForm } = useFlags()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      {smUp ? (
        <Stack gap={4} mt={6} px={5}>
          <NewTypographyButton />
          <NewImageButton />
          <NewVideoButton />
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
            <NewVideoButton />
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
