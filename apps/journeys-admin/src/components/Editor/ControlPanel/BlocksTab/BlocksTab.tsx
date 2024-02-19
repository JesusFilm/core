import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import MuiTypography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { NewButtonButton } from './NewButtonButton'
import { NewFormButton } from './NewFormButton'
import { NewImageButton } from './NewImageButton'
import { NewRadioQuestionButton } from './NewRadioQuestionButton'
import { NewSignUpButton } from './NewSignUpButton'
import { NewTextResponseButton } from './NewTextResponseButton'
import { NewTypographyButton } from './NewTypographyButton'
import { NewVideoButton } from './NewVideoButton'

export function BlocksTab(): ReactElement {
  const { formiumForm } = useFlags()

  const { t } = useTranslation('apps-journeys-admin')

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
        {formiumForm && <NewFormButton />}
      </Stack>
      <Box
        sx={{
          py: 4.25,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <MuiTypography align="center">
          {t('Select a Block to Insert')}
        </MuiTypography>
      </Box>
    </>
  )
}
