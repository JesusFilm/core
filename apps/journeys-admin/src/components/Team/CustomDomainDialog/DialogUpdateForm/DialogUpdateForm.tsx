import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Check from '@core/shared/ui/icons/Check'
import Globe2 from '@core/shared/ui/icons/Globe2'
import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'

interface DialogUpdateFormValues {
  domainName: string
}

interface DialogUpdateFormProps {
  showDeleteButton: boolean
  loading: boolean
}

export function DialogUpdateForm({
  showDeleteButton,
  loading
}: DialogUpdateFormProps): ReactElement {
  const { values, handleChange, errors, handleSubmit } =
    useFormikContext<DialogUpdateFormValues>()

  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack spacing={8}>
      <Stack direction="row" spacing={3}>
        <InformationCircleContained sx={{ color: 'secondary.light' }} />
        <Stack spacing={4}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Typography variant="subtitle1">
              {t('Custom Domain Setup')}
            </Typography>
            <Button endIcon={<LinkExternal />} variant="text" sx={{ py: 0 }}>
              <Typography variant="body2"> {t('Instructions')}</Typography>
            </Button>
          </Stack>
          <Typography variant="body2">
            {t(
              'NextSteps provides all journeys with a your.nextstep.is URL. However, to provide greater personalization and flexibility to your team, you can instead add a custom domain. To get started you’ll need to purchase a domain, complete the form below, and point it to NextSteps servers.'
            )}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={3} alignItems="start">
        <Globe2
          sx={{
            color: 'secondary.light',
            '&.MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium': {
              mt: '6px'
            }
          }}
        />
        <TextField
          disabled={showDeleteButton || loading}
          id="domainName"
          name="domainName"
          focused
          fullWidth
          value={values.domainName}
          placeholder="your.nextstep.is"
          variant="outlined"
          error={Boolean(errors.domainName)}
          onChange={handleChange}
          helperText={
            errors.domainName !== undefined ? errors.domainName : null
          }
          label={t('Domain Name')}
          size="medium"
          sx={{
            '.MuiInputBase-input.MuiOutlinedInput-input': {
              height: '12px'
            },
            '&>.MuiInputLabel-root.Mui-focused': {
              color: 'secondary.light'
            },
            '&>.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
              {
                borderColor: 'secondary.light'
              }
          }}
        />
        <Button
          disabled={loading}
          onClick={async () => handleSubmit()}
          sx={{
            color: 'secondary.light',
            borderColor: 'secondary.light'
          }}
          startIcon={
            showDeleteButton ? (
              <></>
            ) : (
              <Check sx={{ color: 'secondary.light' }} />
            )
          }
          variant="outlined"
        >
          {showDeleteButton ? t('Reset') : t('Apply')}
        </Button>
      </Stack>
    </Stack>
  )
}
