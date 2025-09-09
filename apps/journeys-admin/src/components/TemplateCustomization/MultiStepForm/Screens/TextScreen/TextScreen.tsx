import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { GetJourney_journey_journeyCustomizationFields as JourneyCustomizationField } from '../../../../../../__generated__/GetJourney'
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
  onValueChange: (key: string, value: string) => void,
  isSmallScreen: boolean
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
          fontWeight: isSmallScreen ? 400 : 700,
          lineHeight: 1.4
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
                ; (nextEl as HTMLElement).focus()
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
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
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
        maxWidth: '1000px',
        width: '100%'
      }}
    >
      <Stack alignItems="center" sx={{ pb: 4 }}>
        <Typography variant="h4" component="h1" fontSize={isSmallScreen ? '20px' : '24px'} gutterBottom sx={{ mb: { xs: 0, sm: 2 } }}>
          {t('Text')}
        </Typography>
        <Typography
          variant={isSmallScreen ? "body2" : "h6"}
          fontSize={isSmallScreen ? '14px' : '16px'}
          color="text.secondary"
          align='center'
          sx={{
            maxWidth: { xs: '100%', sm: '75%' }
          }}
        >
          {t("Fill out the blue fields and we'll customise the content with your information.")}
        </Typography>
      </Stack>
      <Box
        sx={{
          border: '2px solid',
          borderColor: '#CCCCCC',
          borderRadius: 3,
          p: { xs: '16px', sm: '20px' },
          minHeight: 200,
          width: '100%',
          whiteSpace: 'pre-wrap'
        }}
        style={{ color: '#000000', fontSize: isSmallScreen ? '16px' : '18px' }}
      >
        {renderEditableText(
          journey?.journeyCustomizationDescription ?? '',
          replacementItems,
          handleValueChange,
          isSmallScreen
        )}
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
        loading={isSubmitting}
        aria-label={t('Save and continue')}
        sx={{
          width: { xs: '136px', sm: '128px' },
          height: { xs: '40px', sm: '42px' },
          alignSelf: 'center',
          mt: { xs: 6, sm: 4 },
          borderRadius: '8px',
          py: '12px'
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          {!isSmallScreen && (<Typography sx={{ fontWeight: 'bold' }}>{t('Next Step')}</Typography>)}
          <ArrowRightIcon sx={{ fontSize: { xs: '24px', sm: '16px' } }} />
        </Stack>
      </Button>
    </Stack >
  )
}
