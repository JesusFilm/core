import { ReactElement } from 'react'
import InsertPhotoRounded from '@mui/icons-material/InsertPhotoRounded'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import MuiTypography from '@mui/material/Typography'
import { Button } from '../Button'
import { Typography } from './Typography'
import { NewVideoButton } from './NewVideoButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSignUpButton } from './NewSignUpButton'

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
        <Typography />
        <Button icon={<InsertPhotoRounded />} value="Image" />
        <NewVideoButton />
        <NewRadioQuestionButton />
        <NewSignUpButton />
      </Stack >
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
