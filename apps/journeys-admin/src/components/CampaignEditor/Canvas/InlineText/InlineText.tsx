import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
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
  featuredMediaBullets,
  splitParagraphs
} from '@core/journeys/ui/Campaign'
import {
  TRANSLATED_FIELDS,
  textLength,
  translatedFieldCap
} from '@core/journeys/ui/Campaign/libs/translatedField'

import { campaignTextInputKey } from '../../../../libs/useCampaignBlockTextMutation'
import { InlineEditInput } from '../../../Editor/Slider/Content/Canvas/InlineEditWrapper/InlineEditInput'
import { focusWithoutScroll } from '../../utils/focusWithoutScroll'
import { useCampaignTextCommand } from '../../utils/useCampaignTextCommand'
import type { CampaignTextTarget } from '../../utils/useCampaignTextCommand'

/** Show the character counter once this share of the cap is used. */
const COUNTER_THRESHOLD = 0.8

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
  /**
   * How the unselected text lays out, as the public section does: one text,
   * one paragraph per blank-line-separated run (Rich Text), or one list item
   * per line with accent markers (Featured Media bullets). Editing is always
   * one textarea, and an empty text shows its placeholder or fallback as text.
   */
  display?: 'text' | 'paragraphs' | 'bullets'
}

/** The cap of an inline text, from the Translated Field declaration, which declares every inline text field. */
export function inlineTextCap(target: CampaignTextTarget): number {
  if (target.string != null) return TRANSLATED_FIELDS.string.value
  return (
    translatedFieldCap(
      { kind: 'block', typename: target.block.__typename },
      campaignTextInputKey(target.field)
    ) ?? 0
  )
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
  autoWidth = false,
  display = 'text'
}: InlineTextProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const max = inlineTextCap(target)
  const { value, fallback, error, handleChange, handleFocus, handleBlur } =
    useCampaignTextCommand(target)
  const [overLength, setOverLength] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // The click on the static text that selects its block also asks for the
  // caret, whatever the host's `autoFocus` says, so every inline text shows
  // where typing goes as soon as it opens.
  const focusOnEdit = useRef(false)
  const length = textLength(value)
  const testId = inlineTextTestId(target)
  const showingFallback = value === '' && fallback !== ''

  useEffect(() => {
    const wanted = autoFocus || focusOnEdit.current
    focusOnEdit.current = false
    if (!editing || !wanted) return
    focusWithoutScroll(inputRef.current)
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
    focusOnEdit.current = true
    onSelect?.()
  }

  const items =
    display === 'paragraphs'
      ? splitParagraphs(value)
      : display === 'bullets'
        ? featuredMediaBullets(value)
        : []

  if (!editing && display === 'paragraphs' && items.length > 0)
    return (
      <Stack
        spacing={3}
        data-testid={testId}
        onClick={handleClick}
        sx={{ cursor: 'text', ...sx }}
      >
        {items.map((paragraph, index) => (
          <Typography
            key={index}
            variant={variant}
            align={align}
            variantMapping={variantMapping}
            data-testid="InlineTextParagraph"
            sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
          >
            {paragraph}
          </Typography>
        ))}
      </Stack>
    )

  if (!editing && display === 'bullets' && items.length > 0)
    return (
      <Box
        component="ul"
        data-testid={testId}
        onClick={handleClick}
        sx={{ m: 0, pl: 3, cursor: 'text', ...sx }}
      >
        {items.map((bullet, index) => (
          <Typography
            key={index}
            component="li"
            variant={variant}
            align={align}
            sx={{
              mb: 1,
              wordBreak: 'break-word',
              '&::marker': { color: 'var(--campaign-band-accent)' }
            }}
          >
            {bullet}
          </Typography>
        ))}
      </Box>
    )

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
      ? t('Max {{max}} characters', { max })
      : length >= max * COUNTER_THRESHOLD
        ? t('{{length}} / {{max}}', { length, max })
        : undefined)

  // What the textarea shows: the text, or its placeholder while empty. A
  // trailing newline is an empty last line in a textarea, so the copy gets a
  // zero-width character after it to measure that line too.
  const shown =
    value === '' ? (fallback !== '' ? fallback : placeholder) : value
  const sizerText = shown.endsWith('\n') ? `${shown}\u200b` : shown

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
        minWidth: 0,
        ...(autoWidth
          ? {
              gridArea: '1 / 1',
              width: '100%',
              '& .MuiInputBase-input': { minWidth: 0, width: '100%' }
            }
          : {
              // Laid over the hidden copy, which alone sizes the cell: the
              // textarea fills it instead of the whole-pixel height its
              // autosize measures, so editing text is exactly as tall as the
              // static text it replaces.
              position: 'absolute',
              inset: 0,
              display: 'flex',
              '& textarea:not([aria-hidden])': {
                height: '100% !important',
                overflow: 'hidden !important',
                wordBreak: 'break-word'
              }
            })
      }}
    />
  )

  // A hidden copy of the text sets the cell's size; the input fills the same
  // cell, so it is exactly as wide (a button label) or as tall as what is
  // typed, and the editing text measures like the static text.
  const sizer = (
    <Box
      component="span"
      aria-hidden
      data-testid="InlineTextSizer"
      sx={{
        gridArea: '1 / 1',
        visibility: 'hidden',
        overflow: 'hidden',
        ...(autoWidth
          ? { whiteSpace: 'pre' }
          : { whiteSpace: 'pre-wrap', wordBreak: 'break-word' })
      }}
    >
      {sizerText}
    </Box>
  )

  // The editing text is the same Typography element as the static text, so
  // it carries the same variant margins and its container treats it the same.
  return (
    <Typography
      variant={variant}
      component="div"
      align={align}
      variantMapping={variantMapping}
      data-testid={testId}
      onClick={(event) => event.stopPropagation()}
      sx={{
        ...(autoWidth ? { maxWidth: '100%', minWidth: 0 } : { width: '100%' }),
        ...sx
      }}
    >
      <Box
        sx={
          autoWidth
            ? { display: 'inline-grid', maxWidth: '100%' }
            : { display: 'grid', position: 'relative' }
        }
      >
        {sizer}
        {input}
      </Box>
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
    </Typography>
  )
}
