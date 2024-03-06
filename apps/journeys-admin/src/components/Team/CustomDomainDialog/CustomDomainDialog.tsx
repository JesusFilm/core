import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'
import Check from '@core/shared/ui/icons/Check'
import CopyLeft from '@core/shared/ui/icons/CopyLeft'

import { useCustomDomain } from '../CustomDomainProvider'

interface CustomDomainDialogProps {
  open: boolean
  onClose: () => void
}

export function CustomDomainDialog({
  open,
  onClose
}: CustomDomainDialogProps): ReactElement {
  // TODO: state changes replaced with network calls
  const { customDomain, setCustomDomain } = useCustomDomain()

  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const validationSchema = object({
    domainName: string()
      .trim()
      .nonNullable()
      .required(t('Domain name is a required field'))
  })
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  async function handleCopyClick(value): Promise<void> {
    await navigator.clipboard.writeText(value ?? '')
    enqueueSnackbar('Address copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  async function handleSubmit(value, { resetForm }): Promise<void> {
    if (customDomain != null) {
      setCustomDomain(null)
      resetForm()
    } else {
      setCustomDomain(value.domainName)
    }
    enqueueSnackbar('Custom domain updated', {
      variant: 'success',
      preventDuplicate: false
    })
  }

  return (
    <Formik
      initialValues={{ domainName: '' }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ values, errors, handleChange, handleSubmit, resetForm }) => (
        <Dialog
          open={open}
          onClose={onClose}
          divider
          dialogTitle={{ title: t('Custom Domain Settings') }}
          fullscreen={!smUp}
        >
          <Form>
            <Stack spacing={10}>
              <Stack spacing={4}>
                <Typography variant="subtitle1">
                  {t('Your domain name')}
                </Typography>
                <TextField
                  id="domainName"
                  name="domainName"
                  fullWidth
                  value={values.domainName}
                  variant="filled"
                  error={Boolean(errors.domainName)}
                  onChange={handleChange}
                  helperText={
                    errors.domainName !== undefined
                      ? (errors.domainName as string)
                      : null
                  }
                  label={t('Domain Name')}
                  InputProps={{
                    endAdornment: (
                      <Button onClick={async () => handleSubmit()}>
                        {customDomain != null ? t('Delete') : t('Update')}
                      </Button>
                    )
                  }}
                />
              </Stack>
              {customDomain != null && customDomain !== '' && (
                <Stack spacing={4}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      {t('DNS Config')}
                    </Typography>
                    <Chip
                      icon={
                        <Check
                          sx={{
                            borderRadius: 777,
                            backgroundColor: 'success.main',
                            '&.MuiSvgIcon-root': { color: 'background.paper' }
                          }}
                        />
                      }
                      label="Status"
                    />
                  </Stack>
                  <Stack spacing={4}>
                    <Stack
                      direction={smUp ? 'row' : 'column'}
                      sx={{ width: '100%' }}
                    >
                      <Box
                        sx={{
                          border: '2px solid',
                          borderColor: 'divider',
                          color: 'secondary.light',
                          borderRadius: '8px 0px 0px 8px',
                          p: 4,
                          flexGrow: 1
                        }}
                      >
                        {t('A Record')}
                      </Box>
                      <Box
                        sx={{
                          borderTop: '2px solid',
                          borderBottom: '2px solid',
                          borderColor: 'divider',
                          color: 'secondary.light',
                          p: 4,
                          flexGrow: 1
                        }}
                      >
                        {t('@')}
                      </Box>
                      <Box
                        sx={{
                          border: '2px solid',
                          borderRadius: '0px 8px 8px 0px',
                          borderColor: 'divider',
                          color: 'secondary.light',
                          pl: 4,
                          flexGrow: 1
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          height="100%"
                          justifyContent="space-between"
                        >
                          {t('172.16.1.1')}
                          <IconButton
                            onClick={async () =>
                              await handleCopyClick('172.16.1.1')
                            }
                            aria-label="Copy"
                          >
                            <CopyLeft />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
