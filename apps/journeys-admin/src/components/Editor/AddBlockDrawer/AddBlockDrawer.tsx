import { ReactElement } from 'react'

import Stack from '@mui/material/Stack'

import { NewTypographyButton } from '../Canvas/AddBlockButton/NewTypographyButton'
import { NewImageButton } from '../Canvas/AddBlockButton/NewImageButton'
import { NewVideoButton } from '../Canvas/AddBlockButton/NewVideoButton'
import { NewRadioQuestionButton } from '../Canvas/AddBlockButton/NewRadioQuestionButton'
import { NewTextResponseButton } from '../Canvas/AddBlockButton/NewTextResponseButton'
import { NewSignUpButton } from '../Canvas/AddBlockButton/NewSignUpButton'
import { NewButtonButton } from '../Canvas/AddBlockButton/NewButtonButton'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { NewFormButton } from '../Canvas/AddBlockButton/NewFormButton'
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
