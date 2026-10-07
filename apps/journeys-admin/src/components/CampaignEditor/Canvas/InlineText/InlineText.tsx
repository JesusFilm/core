import Box from '@mui/material/Box'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react'

import {
  CAMPAIGN_TEXT_CAPS,
  CampaignTextBlock,
  CampaignTextField
} from '../../../../libs/useCampaignBlockTextMutation'
import { InlineEditInput } from '../../../Editor/Slider/Content/Canvas/InlineEditWrapper/InlineEditInput'
import { useCampaignTextCommand } from '../../utils/useCampaignTextCommand'

/** Show the character counter once this share of the cap is used. */
const COUNTER_THRESHOLD = 0.8

interface InlineTextProps
  extends Pick<TypographyProps, 'variant' | 'component' | 'align' | 'sx'> {
  block: CampaignTextBlock
  field: CampaignTextField
  placeholder: string
  /** Render as an input (the block is selected) rather than as text. */
  editing: boolean
  /** Take focus when the input mounts. */
  autoFocus?: boolean
  /** Bumped by the Edit action; focuses an input that is already mounted. */
  focusRequest?: number
  /** The preview-language value to show instead; it is read-only because the canvas edits the default language. */
  translation?: string
  /** Clicking the text selects its block and names the field clicked. */
  onSelect?: (field: CampaignTextField) => void
  variantMapping?: TypographyProps['variantMapping']
}

/** Count text the way the API does: Unicode code points after trim. */
export function textLength(value: string): number {
  return [...value.trim()].length
}

/**
 * One inline-editable text field on the canvas. Unselected it renders as
 * the public page does (empty text shows the placeholder, muted); selected it
 * is an input inheriting the same typography. The only pre-validation is the
 * pure length rule with a character counter; the API re-checks everything
 * and its message is shown verbatim under the field when a save fails.
 */
export function InlineText({
  block,
  field,
  placeholder,
  editing,
  autoFocus = false,
  focusRequest = 0,
  translation,
  onSelect,
  variant,
  component,
  align,
  sx,
  variantMapping
}: InlineTextProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const max = CAMPAIGN_TEXT_CAPS[field]
  const { value, error, handleChange, handleFocus, handleBlur } =
    useCampaignTextCommand({ block, field })
  const [overLength, setOverLength] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const length = textLength(value)
  const testId = `InlineText-${field}`
  const showInput = editing && translation == null
  const displayed = translation ?? value

  useEffect(() => {
    if (focusRequest === 0 || !autoFocus) return
    inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest])

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const next = event.target.value
    if (textLength(next) > max) {
      setOverLength(true)
      return
    }
    setOverLength(false)
    handleChange(next)
  }

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    onSelect?.(field)
  }

  if (!showInput)
    return (
      <Typography
        variant={variant}
        component={component ?? 'p'}
        align={align}
        variantMapping={variantMapping}
        data-testid={testId}
        onClick={handleClick}
        sx={{
          cursor: 'text',
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          ...(displayed === '' ? { opacity: 0.5 } : {}),
          ...sx
        }}
      >
        {displayed === '' ? placeholder : displayed}
      </Typography>
    )

  const helper =
    error ??
    (overLength
      ? t('Max {{count}} characters', { count: max })
      : length >= max * COUNTER_THRESHOLD
        ? t('{{length}} / {{max}}', { length, max })
        : undefined)

  return (
    <Box
      sx={{ width: '100%', ...sx }}
      data-testid={testId}
      onClick={(event) => event.stopPropagation()}
    >
      <Typography
        variant={variant}
        component="div"
        align={align}
        variantMapping={variantMapping}
        sx={{ color: 'inherit' }}
      >
        <InlineEditInput
          name={field}
          fullWidth
          multiline
          autoFocus={autoFocus}
          inputRef={inputRef}
          value={value}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputProps={{ 'aria-label': placeholder }}
        />
      </Typography>
      {helper != null && (
        <Typography
          variant="caption"
          component="p"
          role={error != null || overLength ? 'alert' : undefined}
          sx={{
            mt: 0.5,
            opacity: 0.8,
            color: error != null || overLength ? 'error.main' : 'inherit'
          }}
        >
          {helper}
        </Typography>
      )}
    </Box>
  )
}
