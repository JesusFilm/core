import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useEffect, useRef, useState } from 'react'

import { GetCampaignAccessibleJourneys_journeys as AccessibleJourney } from '../../../../../__generated__/GetCampaignAccessibleJourneys'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { useCampaignAccessibleJourneysLazyQuery } from '../../../../libs/useCampaignAccessibleJourneysLazyQuery'
import { messageOf } from '../../utils/messageOf'

/**
 * The admin link a picked journey is added by: the create takes a journey
 * link, so the picker builds the one the paste path would have been given.
 * The API reads the journey id off the path, whatever the host.
 */
export function journeyAdminLink(journeyId: string): string {
  return `https://admin.nextstep.is/journeys/${journeyId}`
}

interface JourneyPickerProps {
  /** Keep the picked journey, by the admin link built from its id; a thrown error's message is shown under the field. */
  onLink: (url: string, journey: AccessibleJourney) => Promise<void>
  /** Shown when nothing has been typed yet. */
  label?: string
  /** Only journeys in these statuses are offered; both by default. */
  statuses?: JourneyStatus[]
  autoFocus?: boolean
  disabled?: boolean
}

/**
 * The journey picker: every published or archived journey the author can
 * read, across all of their teams and those shared with them, fetched when the
 * field opens and filtered by title as they type. Each row shows the title,
 * the team and the status. Picking a journey links it by the admin link
 * built from its id, the same link the paste field submits.
 */
export function JourneyPicker({
  onLink,
  label,
  statuses = [JourneyStatus.published, JourneyStatus.archived],
  autoFocus = false,
  disabled = false
}: JourneyPickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [load, { called, data, dataState, loading, error: loadError }] =
    useCampaignAccessibleJourneysLazyQuery()
  const [inputValue, setInputValue] = useState('')
  const [linkError, setLinkError] = useState<string>()
  const [linking, setLinking] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldLabel = label ?? t('Search your journeys')

  // Without scrolling: the field sits in the scaled canvas frame, and a plain
  // focus() would scroll the editor page that holds it.
  useEffect(() => {
    if (autoFocus)
      rootRef.current?.querySelector('input')?.focus({ preventScroll: true })
  }, [autoFocus])

  async function handlePick(journey: AccessibleJourney | null): Promise<void> {
    if (journey == null || linking) return
    setLinking(true)
    setLinkError(undefined)
    try {
      await onLink(journeyAdminLink(journey.id), journey)
      setInputValue('')
    } catch (error) {
      setLinkError(messageOf(error))
    } finally {
      setLinking(false)
    }
  }

  function statusLabel(status: JourneyStatus): string {
    return status === JourneyStatus.archived ? t('Archived') : t('Published')
  }

  return (
    <Stack
      ref={rootRef}
      data-testid="JourneyPicker"
      onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      sx={{ width: '100%' }}
    >
      <Autocomplete
        value={null}
        options={
          dataState === 'complete'
            ? data.journeys.filter(({ status }) => statuses.includes(status))
            : []
        }
        loading={loading}
        disabled={disabled}
        inputValue={inputValue}
        onInputChange={(_event, value, reason) => {
          if (reason === 'reset') return
          setInputValue(value)
          if (linkError != null) setLinkError(undefined)
        }}
        onOpen={() => {
          if (!called || loadError != null) void load()
        }}
        onChange={(_event, journey) => {
          void handlePick(journey)
        }}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loadingText={t('Loading journeys…')}
        noOptionsText={
          loadError != null
            ? t('Could not load your journeys')
            : t('No journeys found')
        }
        size="small"
        fullWidth
        renderOption={(props, option) => {
          const { key, ...optionProps } = props
          return (
            <Stack
              component="li"
              key={key}
              direction="row"
              spacing={2}
              data-testid={`JourneyPickerOption-${option.id}`}
              {...optionProps}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {option.title}
                </Typography>
                {option.team != null && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {option.team.title}
                  </Typography>
                )}
              </Stack>
              <Chip
                size="small"
                variant="outlined"
                color={
                  option.status === JourneyStatus.published
                    ? 'success'
                    : 'default'
                }
                label={statusLabel(option.status)}
              />
            </Stack>
          )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={fieldLabel}
            error={linkError != null}
            helperText={linkError}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                'aria-label': fieldLabel
              }
            }}
          />
        )}
      />
    </Stack>
  )
}
