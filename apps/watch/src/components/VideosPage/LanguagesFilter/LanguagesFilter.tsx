import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export function LanguagesFilter(): ReactElement {
  return (
    <Stack direction="column" spacing={5} sx={{ minWidth: '278px' }}>
      <Divider />
      <Typography>Languages</Typography>
      <LanguageAutocomplete />
      <Button>+180 Languages</Button>
      <Divider />
    </Stack>
  )
}
