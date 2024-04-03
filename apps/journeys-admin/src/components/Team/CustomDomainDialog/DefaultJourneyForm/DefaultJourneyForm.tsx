import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Computer from '@core/shared/ui/icons/Computer'

import { GetAdminJourneys_journeys as Journeys } from '../../../../../__generated__/GetAdminJourneys'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'

interface DefaultJourneyFormProps {
  customDomain?: CustomDomain
  loading?: boolean
}

export function DefaultJourneyForm({
  customDomain
}: DefaultJourneyFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={3}>
        <Computer sx={{ color: 'secondary.light' }} />
        <Stack spacing={4} width="100%">
          <Typography variant="subtitle1">{t('Default Journey')}</Typography>
          <Stack direction="row" justifyContent="space-between">
            <FormControl variant="filled" fullWidth hiddenLabel>
              <Autocomplete
                data-testid="DefaultJourneySelect"
                id="defaultJourney"
                defaultValue={customDomain?.name}
                onChange={async (_e, option) =>
                  await handleOnChange(option as Journeys)
                }
                getOptionLabel={(options) => options.title}
                options={journeys ?? []}
                renderInput={(params) => <TextField {...params} />}
                blurOnSelect
              />
              <FormHelperText sx={{ wordBreak: 'break-all' }}>
                {t(`The default Journey will be available at ${domainName}`)}
              </FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
