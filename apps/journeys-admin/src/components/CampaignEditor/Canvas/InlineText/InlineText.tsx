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

import { campaignTextCap } from '../../../../libs/useCampaignBlockTextMutation'
import { InlineEditInput } from '../../../Editor/Slider/Content/Canvas/InlineEditWrapper/InlineEditInput'
import { useCampaignTextCommand } from '../../utils/useCampaignTextCommand'
import type { CampaignTextTarget } from '../../utils/useCampaignTextCommand'

/** Show the character counter once this share of the cap is used. */
const COUNTER_THRESHOLD = 0.8

/** `CampaignString.value` cap (PRD §15). */
export const CAMPAIGN_STRING_CAP = 200

interface InlineTextProps
  extends Pick<TypographyProps, 'variant' | 'component' | 'align' | 'sx'> {
  /** The block field or Campaign String this text edits. */
  target: CampaignTextTarget
  placeholder: string
  /** Render as an input (the block is selected) rather than as text. */
  editing: boolean
  /** Take focus when the input mounts. */
  autoFocus?: boolean
  /** Clicking the text selects its block. */
  onSelect?: () => void
  variantMapping?: TypographyProps['variantMapping']
  /**
   * Size the input to its text (a button label): it grows as the author
   * types, never wider than its container, instead of taking the full width
   * like a text field. Still multi-line: Enter inserts a line break.
   */
  autoWidth?: boolean
}

/** Count text the way the API does: Unicode code points after trim. */
export function textLength(value: string): number {
  return [...value.trim()].length
}

export function inlineTextTestId(target: CampaignTextTarget): string {
  return target.string != null
    ? `InlineText-string-${target.string.key}`
    : `InlineText-${target.field}`
}

/**
 * One inline-editable text on the canvas: a block's text field or a Campaign
 * String. Unselected it renders as the public page does (empty text shows
 * the placeholder, muted); selected it is an input inheriting the same
 * typography. While previewing a non-default language an untranslated text
 * shows the default-language fallback, marked, and the input's placeholder is
 * that fallback. The only pre-validation is the pure length rule with a
 * character counter; the API re-checks everything and its message is shown
 * verbatim under the field when a save fails.
 */
export function InlineText({
  target,
  placeholder,
  editing,
  autoFocus = false,
  onSelect,
  variant,
  component,
  align,
  sx,
  variantMapping,
  autoWidth = false
}: InlineTextProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const max =
    target.string != null
      ? CAMPAIGN_STRING_CAP
      : campaignTextCap(target.block.__typename, target.field)
  const { value, fallback, error, handleChange, handleFocus, handleBlur } =
    useCampaignTextCommand(target)
  const [overLength, setOverLength] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const length = textLength(value)
  const testId = inlineTextTestId(target)
  const showingFallback = value === '' && fallback !== ''

  // Focus without scrolling: a plain focus() (and the autoFocus attribute)
  // scrolls every ancestor to centre the input, including the editor page that
  // holds the scaled frame.
  useEffect(() => {
    if (!editing || !autoFocus) return
    inputRef.current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

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
    onSelect?.()
  }

  if (!editing)
    return (
      <Typography
        variant={variant}
        component={component ?? 'p'}
        align={align}
        variantMapping={variantMapping}
        data-testid={testId}
        data-fallback={showingFallback ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          cursor: 'text',
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          ...(value === '' && !showingFallback ? { opacity: 0.5 } : {}),
          ...(showingFallback ? { opacity: 0.7 } : {}),
          ...sx
        }}
      >
        {value === '' ? (showingFallback ? fallback : placeholder) : value}
      </Typography>
    )

  const helper =
    error ??
    (overLength
      ? t('Max {{count}} characters', { count: max })
      : length >= max * COUNTER_THRESHOLD
        ? t('{{length}} / {{max}}', { length, max })
        : undefined)

  const input = (
    <InlineEditInput
      name={target.string != null ? target.string.key : target.field}
      fullWidth
      multiline
      inputRef={inputRef}
      value={value}
      placeholder={fallback !== '' ? fallback : placeholder}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputProps={{
        'aria-label': placeholder,
        // cols 1 drops the textarea's default width, so the hidden sizer
        // alone decides the cell's width.
        ...(autoWidth ? { cols: 1 } : {})
      }}
      sx={{
        // The shared input paints its caret in the admin red, which vanishes
        // on a red campaign button; the text colour always contrasts.
        caretColor: 'currentColor',
        ...(autoWidth
          ? {
              gridArea: '1 / 1',
              minWidth: 0,
              width: '100%',
              '& .MuiInputBase-input': { minWidth: 0, width: '100%' }
            }
          : {})
      }}
    />
  )

  return (
    <Box
      sx={{
        ...(autoWidth ? { maxWidth: '100%', minWidth: 0 } : { width: '100%' }),
        ...sx
      }}
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
        {autoWidth ? (
          // A hidden copy of the text sets the cell's width (its longest
          // line); the input fills the same cell, so it is exactly as wide as
          // what is typed.
          <Box sx={{ display: 'inline-grid', maxWidth: '100%' }}>
            <Box
              component="span"
              aria-hidden
              data-testid="InlineTextSizer"
              sx={{
                gridArea: '1 / 1',
                visibility: 'hidden',
                whiteSpace: 'pre',
                overflow: 'hidden'
              }}
            >
              {value === ''
                ? fallback !== ''
                  ? fallback
                  : placeholder
                : value}
            </Box>
            {input}
          </Box>
        ) : (
          input
        )}
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
