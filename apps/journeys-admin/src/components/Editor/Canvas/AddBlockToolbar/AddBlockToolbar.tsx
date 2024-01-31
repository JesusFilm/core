import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

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
        <AddIcon sx={{ m: 3 }} />
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
