import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import MuiTypography from '@mui/material/Typography'
import { NewVideoButton } from './NewVideoButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewImageButton } from './NewImageButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSignUpButton } from './NewSignUpButton'
import { NewButtonButton } from './NewButtonButton'
import { NewTextResponseButton } from './NewTextResponseButton'

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
