import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Computer from '@core/shared/ui/icons/Computer'

import { GetAdminJourneys_journeys as Journeys } from '../../../../../__generated__/GetAdminJourneys'

interface DefaultJourneyFormProps {
  handleOnChange: (e: SelectChangeEvent) => Promise<void>
  defaultValue?: string
  journeys?: Journeys[]
  domainName: string
}

export function DefaultJourneyForm({
  handleOnChange,
  defaultValue,
  journeys,
  domainName
}: DefaultJourneyFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={3}>
        <Computer />
        <Stack spacing={4} width="100%">
          <Typography variant="subtitle1">{t('Default Journey')}</Typography>
          <Stack direction="row" justifyContent="space-between">
            <FormControl variant="filled" fullWidth hiddenLabel>
              <Select
                data-testid="DefaultJourneySelect"
                id="defaultJourney"
                name="defaultJourney"
                onChange={handleOnChange}
                defaultValue={defaultValue}
                variant="outlined"
              >
                {journeys?.map((journey) => (
                  <MenuItem value={journey.id} key={journey.id}>
                    {journey.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {t(`The default Journey will be available at ${domainName}`)}
              </FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
