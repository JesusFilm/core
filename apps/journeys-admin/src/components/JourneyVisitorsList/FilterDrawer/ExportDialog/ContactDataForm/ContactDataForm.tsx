import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useMemo,
  useState
} from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'

import { CheckboxOption } from '../CheckBoxOption'

interface ContactDataFormProps {
  setSelectedFields: Dispatch<SetStateAction<string[]>>
  selectedFields: string[]
  includeOldData?: boolean
  setIncludeOldData?: Dispatch<SetStateAction<boolean>>
  availableBlockTypes?: string[]
}

/**
 * Form component that allows users to select which contact data fields to export.
 * Contains switches for name, email, and phone fields.
 *
 * @param setContactData - Callback function to update the selected contact data array in the parent component
 * @returns A form with switches for selecting contact data fields
 */
export function ContactDataForm({
  setSelectedFields,
  selectedFields,
  includeOldData = false,
  setIncludeOldData,
  availableBlockTypes = []
}: ContactDataFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [isOptionalSettingsOpen, setIsOptionalSettingsOpen] = useState(false)

  const CONTACT_BLOCK_TO_EVENT: Record<string, string> = {
    RadioQuestionBlock: 'RadioQuestionSubmissionEvent',
    MultiselectBlock: 'MultiselectSubmissionEvent',
    SignUpBlock: 'SignUpSubmissionEvent',
    TextResponseBlock: 'TextResponseSubmissionEvent'
  }

  const availableContactEvents = useMemo(() => {
    const mapped = availableBlockTypes
      .map((bt) => CONTACT_BLOCK_TO_EVENT[bt])
      .filter((v): v is string => v != null)
    return Array.from(new Set(mapped))
  }, [availableBlockTypes])

  const handleSelectAll = (checked: boolean): void => {
    setSelectedFields(checked ? availableContactEvents : [])
  }

  const toggleField = (field: string) => {
    return (checked: boolean) =>
      setSelectedFields((prev) =>
        !checked
          ? prev.filter((f) => f !== field)
          : Array.from(new Set([...prev, field]))
      )
  }

  const handleIncludeOldDataChange = (checked: boolean): void => {
    if (setIncludeOldData != null) {
      setIncludeOldData(checked)
    }
  }

  const handleToggleOptionalSettings = (): void => {
    setIsOptionalSettingsOpen(!isOptionalSettingsOpen)
  }

  // Initialize selection to "all" exactly once when available events are first known.
  // On subsequent available set changes, preserve user selections but drop any no-longer-available ones.
  const [initialized, setInitialized] = useState(false)
  const availableKey = useMemo(
    () => availableContactEvents.join('|'),
    [availableContactEvents]
  )
  useEffect(() => {
    setSelectedFields((prev) => {
      if (!initialized) {
        setInitialized(true)
        return [...availableContactEvents]
      }
      const filtered = prev.filter((f) => availableContactEvents.includes(f))
      return filtered
    })
    // Only react to content changes, not reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableKey, setSelectedFields])

  return (
    <Stack>
      <FormGroup>
        <CheckboxOption
          checked={
            availableContactEvents.length > 0 &&
            availableContactEvents.every((f) => selectedFields.includes(f))
          }
          onChange={handleSelectAll}
          label={t('All')}
        />
        <Box sx={{ pl: 6, display: 'flex', flexDirection: 'column' }}>
          {availableContactEvents.includes('TextResponseSubmissionEvent') && (
            <CheckboxOption
              checked={selectedFields.includes('TextResponseSubmissionEvent')}
              onChange={toggleField('TextResponseSubmissionEvent')}
              label={t('Text Submission')}
            />
          )}
          {availableContactEvents.includes('RadioQuestionSubmissionEvent') && (
            <CheckboxOption
              checked={selectedFields.includes('RadioQuestionSubmissionEvent')}
              onChange={toggleField('RadioQuestionSubmissionEvent')}
              label={t('Poll Selection')}
            />
          )}
          {availableContactEvents.includes('MultiselectSubmissionEvent') && (
            <CheckboxOption
              checked={selectedFields.includes('MultiselectSubmissionEvent')}
              onChange={toggleField('MultiselectSubmissionEvent')}
              label={t('Multiselect Responses')}
            />
          )}
          {availableContactEvents.includes('SignUpSubmissionEvent') && (
            <CheckboxOption
              checked={selectedFields.includes('SignUpSubmissionEvent')}
              onChange={toggleField('SignUpSubmissionEvent')}
              label={t('Subscription')}
            />
          )}
        </Box>
      </FormGroup>
      <Divider sx={{ my: 2 }} />
      <FormGroup>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          onClick={handleToggleOptionalSettings}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleToggleOptionalSettings()
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isOptionalSettingsOpen}
          aria-label={t('Toggle optional settings')}
        >
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {t('Optional settings')}
          </Typography>
          <IconButton
            size="small"
            sx={{
              transform: isOptionalSettingsOpen
                ? 'rotate(180deg)'
                : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <ChevronDown />
          </IconButton>
        </Box>
        <Collapse in={isOptionalSettingsOpen}>
          <Box sx={{ mt: 1 }}>
            <CheckboxOption
              checked={includeOldData}
              onChange={handleIncludeOldDataChange}
              label={t('Include old data from removed or unconnected cards')}
            />
          </Box>
        </Collapse>
      </FormGroup>
    </Stack>
  )
}
