import { gql } from '@apollo/client';
import { useMutation } from "@apollo/client/react";
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_journeyCustomizationFields as JourneyCustomizationField } from '../../../../../../__generated__/GetJourney'
import { JourneyCustomizationFieldUpdate } from '../../../../../../__generated__/JourneyCustomizationFieldUpdate'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

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
          backgroundColor: '#1E81DB20',
          color: '#1E81DB',
          border: 'none',
          borderRadius: '4px',
          padding: '0px 3px',
          display: 'inline',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          fontWeight: 'bold',
          lineHeight: 1.6
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
                ? Array.from(
                    parent.querySelectorAll('[contenteditable="true"]')
                  )
                : []
            const index = editables.indexOf(e.currentTarget as HTMLElement)
            const nextIndex = e.shiftKey ? index - 1 : index + 1
            const nextEl = editables[nextIndex]
            if (nextEl != null) {
              e.preventDefault()
              ;(nextEl as HTMLElement).focus()
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
  handleScreenNavigation: (screen: CustomizationScreen) => void
}

export function TextScreen({
  handleNext,
  handleScreenNavigation
}: TextScreenProps): ReactElement {
  const { t } = useTranslation()
  const { journey } = useJourney()
  const [journeyCustomizationFieldUpdate, { loading: isSubmitting }] =
    useMutation<JourneyCustomizationFieldUpdate>(
      JOURNEY_CUSTOMIZATION_FIELD_UPDATE
    )
  const [replacementItems, setReplacementItems] = useState<
    JourneyCustomizationField[]
  >(journey?.journeyCustomizationFields ?? [])

  useEffect(() => {
    if (journey?.journeyCustomizationFields != null) {
      setReplacementItems(journey.journeyCustomizationFields)
    }
  }, [journey?.journeyCustomizationFields])

  const handleValueChange = useCallback(
    (key: string, value: string) => {
      setReplacementItems((prev) =>
        prev.map((item) => {
          if (item.key !== key) return item

          if (value.trim() === '') {
            // Find value of original key-value pair to revert token to original value
            const originalItem = journey?.journeyCustomizationFields?.find(
              (o) => o.key === key
            )
            if (originalItem) return { ...item, value: originalItem.value }
          }

          return { ...item, value }
        })
      )
    },
    [journey?.journeyCustomizationFields]
  )

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
      gap={{ xs: 0, sm: 2 }}
      sx={{
        px: { xs: 2, md: 8 },
        width: '100%'
      }}
    >
      <Stack alignItems="center" sx={{ pb: 4 }}>
        <Typography
          variant="h4"
          display={{ xs: 'none', sm: 'block' }}
          gutterBottom
          sx={{
            mb: { xs: 0, sm: 2 }
          }}
        >
          {t('Text')}
        </Typography>
        <Typography
          variant="h6"
          display={{ xs: 'block', sm: 'none' }}
          gutterBottom
          sx={{
            mb: { xs: 0, sm: 2 }
          }}
        >
          {t('Text')}
        </Typography>
        <Typography
          variant="subtitle2"
          display={{ xs: 'none', sm: 'block' }}
          color="text.secondary"
          align="center"
          sx={{
            maxWidth: { xs: '100%', sm: '90%' }
          }}
        >
          {t(
            "Fill out the blue fields and we'll customise the content with your information."
          )}
        </Typography>
        <Typography
          variant="body2"
          display={{ xs: 'block', sm: 'none' }}
          color="text.secondary"
          align="center"
          sx={{
            maxWidth: { xs: '100%', sm: '90%' }
          }}
        >
          {t(
            "Fill out the blue fields and we'll customise the content with your information."
          )}
        </Typography>
      </Stack>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box
          sx={{
            border: '2px solid',
            borderColor: '#CCCCCC',
            borderRadius: 3,
            p: { xs: 4, sm: 5 },
            minHeight: 150,
            width: '100%',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            maxHeight: { xs: 'calc(100vh - 323px)', sm: 'calc(100vh - 370px)' },
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none'
          }}
        >
          {renderEditableText(
            journey?.journeyCustomizationDescription ?? '',
            replacementItems,
            handleValueChange
          )}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30px',
            background:
              'linear-gradient(to bottom, transparent 0%, white 100%)',
            pointerEvents: 'none',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            borderLeft: '2px solid #CCCCCC',
            borderRight: '2px solid #CCCCCC',
            borderBottom: '2px solid #CCCCCC'
          }}
        />
      </Box>
      <CustomizeFlowNextButton
        label={t('Next')}
        onClick={handleSubmit}
        loading={isSubmitting}
        ariaLabel={t('Save and continue')}
      />
    </Stack>
  )
}
