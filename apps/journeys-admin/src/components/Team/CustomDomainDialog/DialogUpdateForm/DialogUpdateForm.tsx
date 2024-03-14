import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
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
import X3 from '@core/shared/ui/icons/X3'

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
              `Using your own domain rather than 'your.nextstep.is' streamlines domain verification for ads, keeps our tool discreet (at a very basic level), and assists in bypassing certain reigonal blocks`
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
          InputProps={{
            endAdornment: showDeleteButton ? (
              <InputAdornment position="start">
                <IconButton
                  onClick={async () => handleSubmit()}
                  data-testid="DeleteCustomDomainIcon"
                >
                  <X3 />
                </IconButton>
              </InputAdornment>
            ) : (
              <></>
            )
          }}
        />
        <Button
          disabled={loading}
          onClick={async () => handleSubmit()}
          sx={{
            color: 'secondary.light',
            borderColor: 'secondary.light',
            display: showDeleteButton ? 'none' : 'flex'
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
          {t('Apply')}
        </Button>
      </Stack>
    </Stack>
  )
}
