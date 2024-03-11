import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

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
    <Stack spacing={4}>
      <Typography variant="subtitle1">{t('Your domain name')}</Typography>
      <TextField
        id="domainName"
        name="domainName"
        fullWidth
        value={values.domainName}
        variant="filled"
        error={Boolean(errors.domainName)}
        onChange={handleChange}
        helperText={errors.domainName !== undefined ? errors.domainName : null}
        label={t('Domain Name')}
        InputProps={{
          endAdornment: (
            <Button onClick={async () => handleSubmit()}>
              {customDomains?.length !== 0 && customDomains != null
                ? t('Delete')
                : t('Update')}
            </Button>
          )
        }}
      />
    </Stack>
  )
}
