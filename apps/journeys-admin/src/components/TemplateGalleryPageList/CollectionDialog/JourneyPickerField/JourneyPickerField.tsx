import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, memo, useMemo } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'

const SECTION_HEADER = {
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  fontSize: 16,
  lineHeight: '24px',
  color: '#444451'
} as const

export interface JourneyPickerFieldProps {
  /** Available pool of journeys the user can pick from. */
  availableJourneys: readonly Journey[]
  /** Selected journey ids in user-pick order. */
  journeyIds: readonly string[]
  /** Called when the user adds or removes a journey. */
  onChange: (next: string[]) => void
  /** Called on first interaction so Formik marks the field touched. */
  onTouch?: () => void
  /** Locks the picker — the field still renders but the autocomplete
   * is disabled and a helper text explains why. */
  disabled?: boolean
  /** Helper text shown when disabled. Falls back to a default. */
  disabledHelperText?: string
}

/**
 * Membership picker for the Collection edit/create dialog. A multi-select
 * Autocomplete over `availableJourneys` with an O(1) `journeyById` lookup
 * so per-keystroke cost stays O(N) regardless of pool size.
 */
function JourneyPickerFieldImpl({
  availableJourneys,
  journeyIds,
  onChange,
  onTouch,
  disabled = false,
  disabledHelperText
}: JourneyPickerFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const journeysById = useMemo(
    () => new Map(availableJourneys.map((j) => [j.id, j])),
    [availableJourneys]
  )

  // User-pick order; chips render in this order. Reused for the
  // Autocomplete `value` prop so we don't filter availableJourneys
  // separately.
  const selectedJourneysOrdered = useMemo(
    () =>
      journeyIds
        .map((id) => journeysById.get(id))
        .filter((j): j is Journey => j != null),
    [journeyIds, journeysById]
  )

  return (
    <Stack spacing={1}>
      <Typography sx={SECTION_HEADER}>{t('Templates on the page:')}</Typography>
      <Autocomplete
        multiple
        disableCloseOnSelect
        disabled={disabled}
        options={availableJourneys as Journey[]}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={selectedJourneysOrdered}
        onChange={(_event, selected) => {
          onChange(selected.map((j) => j.id))
          onTouch?.()
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            return (
              <Chip key={key} label={option.title} size="small" {...tagProps} />
            )
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={
              journeyIds.length === 0
                ? t('Select templates to include')
                : undefined
            }
            variant="outlined"
            hiddenLabel
            helperText={
              disabled
                ? (disabledHelperText ??
                  t('Unpublish to change templates in this collection.'))
                : undefined
            }
          />
        )}
      />
    </Stack>
  )
}

export const JourneyPickerField = memo(JourneyPickerFieldImpl)
