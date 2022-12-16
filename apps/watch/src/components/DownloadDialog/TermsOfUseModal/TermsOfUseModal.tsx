import { ComponentProps, ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import { Dialog } from '@core/shared/ui/Dialog'

interface TermsOfUseModalProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

export function TermsOfUseModal({
  open,
  onClose
}: TermsOfUseModalProps): ReactElement {
  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
      }}
      dialogTitle={{
        title: 'Download Video',
        closeButton: true
      }}
    >
      <>
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={4}
          alignItems="flex-start"
          sx={{ mt: { xs: 0, sm: 1 }, mb: { xs: 0, sm: 5 } }}
        >
          <Stack>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Hello
            </Typography>
          </Stack>
        </Stack>
      </>
    </Dialog>
  )
}
