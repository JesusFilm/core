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
  useState
} from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'

import { CheckboxOption } from '../CheckBoxOption'

interface ContactDataFormProps {
  setSelectedFields: Dispatch<SetStateAction<string[]>>
  selectedFields: string[]
  includeOldData?: boolean
  setIncludeOldData?: Dispatch<SetStateAction<boolean>>
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
  setIncludeOldData
}: ContactDataFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [isOptionalSettingsOpen, setIsOptionalSettingsOpen] = useState(false)

  const handleSelectAll = (checked: boolean): void => {
    setSelectedFields(
      checked
        ? [
            'RadioQuestionSubmissionEvent',
            'SignUpSubmissionEvent',
            'TextResponseSubmissionEvent',
            'MultiselectSubmissionEvent'
          ]
        : []
    )
  }

  const toggleField = (field: string) => {
    return (checked: boolean) =>
      setSelectedFields((prev) =>
        !checked ? prev.filter((f) => f !== field) : [...prev, field]
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

  useEffect(() => {
    setSelectedFields([
      'RadioQuestionSubmissionEvent',
      'SignUpSubmissionEvent',
      'TextResponseSubmissionEvent',
      'MultiselectSubmissionEvent'
    ])
  }, [setSelectedFields])

  return (
    <Stack>
      <FormGroup>
        <CheckboxOption
          checked={selectedFields.length === 4}
          onChange={handleSelectAll}
          label={t('All')}
        />
        <Box sx={{ pl: 6, display: 'flex', flexDirection: 'column' }}>
          <CheckboxOption
            checked={selectedFields.includes('TextResponseSubmissionEvent')}
            onChange={toggleField('TextResponseSubmissionEvent')}
            label={t('Text Submission')}
          />
          <CheckboxOption
            checked={selectedFields.includes('RadioQuestionSubmissionEvent')}
            onChange={toggleField('RadioQuestionSubmissionEvent')}
            label={t('Poll Selection')}
          />
          <CheckboxOption
            checked={selectedFields.includes('MultiselectSubmissionEvent')}
            onChange={toggleField('MultiselectSubmissionEvent')}
            label={t('Multiselect Responses')}
          />
          <CheckboxOption
            checked={selectedFields.includes('SignUpSubmissionEvent')}
            onChange={toggleField('SignUpSubmissionEvent')}
            label={t('Subscription')}
          />
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
