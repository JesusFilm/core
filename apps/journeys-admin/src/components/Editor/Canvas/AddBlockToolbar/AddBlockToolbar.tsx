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
import AddIcon from '@mui/icons-material/Add'

export function AddBlockToolbar(): ReactElement {
  const { formiumForm } = useFlags()

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack
        data-testid="AddBlockToolbar"
        sx={{
          justifyContent: 'space-evenly',
          alignItems: 'center',
          display: 'flex'
        }}
      >
        <AddIcon sx={{ my: 3 }} />
        <NewTypographyButton />
        <NewImageButton />
        <NewVideoButton />
        <NewRadioQuestionButton />
        <NewTextResponseButton />
        <NewSignUpButton />
        <NewButtonButton />
        {formiumForm && <NewFormButton />}
      </Stack>
    </>
  )
}
