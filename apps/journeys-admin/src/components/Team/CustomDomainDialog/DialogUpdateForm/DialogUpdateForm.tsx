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

import { GetCustomDomain_customDomains as CustomDomains } from '../../../../../__generated__/GetCustomDomain'

interface DialogUpdateFormValues {
  domainName: string
}

interface DialogUpdateFormProps {
  customDomains?: CustomDomains[]
}

export function DialogUpdateForm({
  customDomains
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
            <Button endIcon={<LinkExternal />} variant="text" sx={{ p: 0 }}>
              {t('Instructions')}
            </Button>
          </Stack>
          <Typography variant="body2">
            {t(
              `Use your own domain rather than 'your.nextstep.is' streamlines domain verification for ads, keeps our tool discreet (at a very basic level), and assists in bypassing certain reigonal blocks`
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
          onClick={async () => handleSubmit()}
          startIcon={<Check />}
          variant="outlined"
        >
          {customDomains?.length !== 0 && customDomains != null
            ? t('Delete')
            : t('Apply')}
        </Button>
      </Stack>
    </Stack>
  )
}
