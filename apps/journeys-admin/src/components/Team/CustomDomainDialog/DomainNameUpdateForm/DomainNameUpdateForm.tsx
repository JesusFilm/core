import { ApolloError } from '@apollo/client'
import Box from '@mui/material/Box'
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

interface DomainNameUpdateFormValues {
  domainName: string
}

interface DomainNameUpdateFormProps {
  showDeleteButton: boolean
  loading: boolean
  errors: ApolloError | undefined
}

export function DomainNameUpdateForm({
  showDeleteButton,
  loading,
  errors
}: DomainNameUpdateFormProps): ReactElement {
  const {
    values,
    handleChange,
    errors: formErrors,
    handleSubmit
  } = useFormikContext<DomainNameUpdateFormValues>()

  const errorMessage =
    errors != null
      ? errors?.message.includes(
          'Unique constraint failed on the fields: (`name`)'
        )
        ? 'domain name already exists'
        : errors.message
      : undefined

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
          disabled={loading}
          id="domainName"
          name="domainName"
          focused
          fullWidth
          value={values.domainName.toLocaleLowerCase().replace(/\s/g, '')}
          placeholder="your.nextstep.is"
          variant="outlined"
          error={formErrors.domainName !== undefined || errorMessage != null}
          onChange={handleChange}
          helperText={
            formErrors.domainName !== undefined || errorMessage != null
              ? formErrors.domainName ?? errorMessage
              : null
          }
          label={t('Domain Name')}
          size="medium"
          InputProps={{
            readOnly: showDeleteButton
          }}
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
        <Box>
          <Button
            disabled={loading}
            onClick={async () => handleSubmit()}
            sx={{
              color: 'secondary.light',
              borderColor: 'secondary.light',
              height: '45px'
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
        </Box>
      </Stack>
    </Stack>
  )
}
