import { ApolloError, gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useState } from 'react'
import { GetJourney_journey_journeyCustomizationFields as JourneyCustomizationField } from '../../../../../../__generated__/GetJourney'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'next-i18next'
import { JourneyCustomizationFieldUpdate } from '../../../../../../__generated__/JourneyCustomizationFieldUpdate'

export const JOURNEY_CUSTOMIZATION_FIELD_UPDATE = gql`
  mutation JourneyCustomizationFieldUpdate(
    $journeyId: ID!
    $input: [JourneyCustomizationFieldInput!]!
  ) {
    journeyCustomizationFieldUserUpdate(journeyId: $journeyId, input: $input) {
      id
      key
      value
    }
  }
`

// Function to render text with editable spans for replaceable parts
const renderEditableText = (
  text: string | null | undefined,
  replacementItems: JourneyCustomizationField[],
  onValueChange: (key: string, value: string) => void
): ReactElement[] => {
  const parts: ReactElement[] = []
  let lastIndex = 0

  const regex = /\{\{([^:]+):\s*([^}]+)\}\}/g
  let match

  const safeText = text ?? ''

  while ((match = regex.exec(safeText)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {safeText.slice(lastIndex, match.index)}
        </span>
      )
    }

    const key = match[1].trim()
    const defaultValue = match[2].trim()

    // Find the replacement item for this key
    const replacementItem = replacementItems.find((item) => item.key === key)
    const currentValue = replacementItem
      ? replacementItem.value || replacementItem.defaultValue
      : defaultValue

    // Add editable span for the replaceable part
    parts.push(
      <span
        key={`editable-${key}`}
        contentEditable
        suppressContentEditableWarning
        tabIndex={0}
        style={{
          backgroundColor: '#42a5f5',
          color: '#ffffff',
          border: 'none',
          borderRadius: '20px',
          padding: '2px 12px',
          minWidth: '20px',
          maxWidth: '100%',
          display: 'inline-block',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          marginBottom: '4px'
        }}
        onBlur={(e) => {
          const newValue = e.currentTarget.textContent || ''
          onValueChange(key, newValue)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab' || e.key === 'Enter') {
            e.currentTarget.blur()

            const newValue = e.currentTarget.textContent || ''
            onValueChange(key, newValue)
            const parent = e.currentTarget.parentElement
            const editables =
              parent != null
                ? (Array.from(
                    parent.querySelectorAll('[contenteditable="true"]')
                  ) as HTMLElement[])
                : []
            const index = editables.indexOf(e.currentTarget as HTMLElement)
            const nextIndex = e.shiftKey ? index - 1 : index + 1
            const nextEl = editables[nextIndex]
            if (nextEl != null) {
              e.preventDefault()
              nextEl.focus()
            }
          }
        }}
      >
        {currentValue}
      </span>
    )

    lastIndex = regex.lastIndex
  }

  // Add remaining text after the last match
  if (lastIndex < safeText.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>{safeText.slice(lastIndex)}</span>
    )
  }

  return parts
}

interface TextScreenProps {
  handleNext: () => void
}

export function TextScreen({ handleNext }: TextScreenProps): ReactElement {
  const { t } = useTranslation()
  const { journey } = useJourney()
  const [journeyCustomizationFieldUpdate, { loading: isSubmitting }] =
    useMutation<JourneyCustomizationFieldUpdate>(
      JOURNEY_CUSTOMIZATION_FIELD_UPDATE
    )
  const [replacementItems, setReplacementItems] = useState<
    JourneyCustomizationField[]
  >(journey?.journeyCustomizationFields ?? [])

  const handleValueChange = useCallback((key: string, value: string) => {
    setReplacementItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    )
  }, [])

  async function handleSubmit(): Promise<void> {
    if (!journey) return
    const originalItems = journey.journeyCustomizationFields ?? []
    const hasChanges = replacementItems.some((item) => {
      const original = originalItems.find((o) => o.id === item.id)
      return (original?.value ?? '') !== (item.value ?? '')
    })

    if (hasChanges) {
      await journeyCustomizationFieldUpdate({
        variables: {
          journeyId: journey.id,
          input: replacementItems.map((item) => ({
            id: item.id,
            key: item.key,
            value: item.value
          }))
        }
      })
    }
    handleNext()
  }

  return (
    <Stack
      alignItems="center"
      sx={{ px: { xs: 2, md: 8 }, maxWidth: '1000px', width: '100%' }}
      gap={6}
    >
      <Typography variant="h6" color="text.secondary">
        {t(
          "Here's a script of this invitation. Change the blue areas and it will be customized for you."
        )}
      </Typography>
      <Box
        sx={{
          border: '3px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 3,
          minHeight: 200,
          width: '100%',
          whiteSpace: 'pre-wrap'
        }}
      >
        {renderEditableText(
          journey?.journeyCustomizationDescription ?? '',
          replacementItems,
          handleValueChange
        )}
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
        loading={isSubmitting}
        aria-label={t('Save and continue')}
        sx={{ width: '300px', alignSelf: 'center', mt: 4 }}
      >
        <ArrowRightIcon />
      </Button>
    </Stack>
  )
}
