import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import MuiTypography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { NewButtonButton } from './NewButtonButton'
import { NewFormButton } from './NewFormButon'
import { NewImageButton } from './NewImageButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSignUpButton } from './NewSignUpButton'
import { NewTextResponseButton } from './NewTextResponseButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewVideoButton } from './NewVideoButton'

export function BlocksTab(): ReactElement {
  return (
    <>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <NewTypographyButton />
        <NewImageButton />
        <NewVideoButton />
        <NewRadioQuestionButton />
        <NewTextResponseButton />
        <NewSignUpButton />
        <NewButtonButton />
        <NewFormButton />
      </Stack>
      <Box
        sx={{
          py: 4.25,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <MuiTypography align="center">Select a Block to Insert</MuiTypography>
      </Box>
    </>
  )
}
