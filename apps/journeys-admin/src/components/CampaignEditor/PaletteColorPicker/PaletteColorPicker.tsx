import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  ReactElement,
  useEffect,
  useState
} from 'react'
import { HexColorPicker } from 'react-colorful'

import CheckIcon from '@core/shared/ui/icons/Check'

import { useCampaignPaletteUpdateMutation } from '../../../libs/useCampaignPaletteUpdateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'

/** The Palette holds the eight most recent colours (PRD §4). */
export const PALETTE_SIZE = 8

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * The editor's pure hex rule, mirroring the API's `assertHex`: trim, accept
 * `#RGB` or `#RRGGBB` in any case (the `#` may be omitted while typing), and
 * return `#RRGGBB` uppercase; anything else is null.
 */
export function normalizeHex(value: string): string | null {
  const match = HEX_PATTERN.exec(value.trim())
  if (match == null) return null
  const digits = match[1]
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits
  return `#${expanded.toUpperCase()}`
}

/**
 * The Palette after a colour is used: it moves to slot 1 (a new colour pushes
 * the oldest out; an existing one just moves, so there are no duplicates),
 * every entry normalised before comparison.
 */
export function nextPalette(palette: readonly string[], hex: string): string[] {
  const used = normalizeHex(hex)
  if (used == null) return [...palette]
  const rest = palette
    .map((entry) => normalizeHex(entry))
    .filter((entry): entry is string => entry != null && entry !== used)
  return [used, ...rest].slice(0, PALETTE_SIZE)
}

interface PaletteColorPickerProps {
  /** The committed colour, or null when the field inherits. */
  value: string | null
  /** What the field shows when it inherits: the picker starts from it. */
  fallback?: string
  /** Names the picker for assistive technology and the hex field. */
  label: string
  /** One call per commit (picker blur, Enter in the hex field, a palette swatch) with `#RRGGBB`. */
  onCommit: (hex: string) => void
  /** Offered when the field may inherit; writes null. */
  onClear?: () => void
  clearLabel?: string
  testId?: string
}

/**
 * The one colour picker every campaign colour goes through: a hex area, a
 * hex field and the campaign's Palette as eight swatches, newest first. The
 * colour commits on blur (or Enter, or a swatch), as one call to `onCommit`;
 * the Palette is saved through `campaignUpdate` at the same moment, outside
 * undo. The only pre-validation is the pure hex rule.
 */
export function PaletteColorPicker({
  value,
  fallback = '#000000',
  label,
  onCommit,
  onClear,
  clearLabel,
  testId = 'PaletteColorPicker'
}: PaletteColorPickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const [paletteUpdate] = useCampaignPaletteUpdateMutation()
  const committed = value ?? fallback
  const [draft, setDraft] = useState(committed)
  const [text, setText] = useState(committed)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    setDraft(committed)
    setText(committed)
    setDirty(false)
    setError(undefined)
  }, [committed])

  const palette = campaign.palette.slice(0, PALETTE_SIZE)
  const slots: Array<string | null> = [
    ...palette,
    ...Array<null>(Math.max(0, PALETTE_SIZE - palette.length)).fill(null)
  ]

  function savePalette(hex: string): void {
    const next = nextPalette(campaign.palette, hex)
    if (next.join() === campaign.palette.join()) return
    // Picker chrome: a failed save rolls the optimistic list back and there
    // is nothing for the author to act on.
    void paletteUpdate({
      variables: { id: campaign.id, input: { palette: next } },
      optimisticResponse: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: campaign.id,
          palette: next
        }
      }
    }).catch(() => undefined)
  }

  function commitHex(hex: string): void {
    setDraft(hex)
    setText(hex)
    setDirty(false)
    setError(undefined)
    savePalette(hex)
    if (hex !== value) onCommit(hex)
  }

  function commit(): void {
    if (!dirty) return
    const hex = normalizeHex(text)
    if (hex == null) {
      setError(t('Enter a hex colour like #RRGGBB'))
      return
    }
    commitHex(hex)
  }

  function handlePickerChange(next: string): void {
    const hex = next.toUpperCase()
    setDraft(hex)
    setText(hex)
    setDirty(true)
    setError(undefined)
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>): void {
    const next = event.target.value
    setText(next)
    setDirty(true)
    setError(undefined)
    const hex = normalizeHex(next)
    if (hex != null) setDraft(hex)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return
    event.preventDefault()
    commit()
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    commit()
  }

  return (
    <Stack
      spacing={3}
      data-testid={testId}
      role="group"
      aria-label={label}
      onBlur={handleBlur}
    >
      <HexColorPicker
        color={draft}
        onChange={handlePickerChange}
        style={{ width: '100%', height: 140 }}
        data-testid={`${testId}-area`}
      />
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          data-testid={`${testId}-swatch`}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1,
            bgcolor: draft,
            border: '1px solid',
            borderColor: 'divider'
          }}
        />
        <TextField
          size="small"
          label={t('Hex')}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          error={error != null}
          helperText={error}
          fullWidth
          slotProps={{
            htmlInput: { 'aria-label': `${label} ${t('hex')}`, maxLength: 7 }
          }}
        />
        {onClear != null && (
          <Button
            size="small"
            color="secondary"
            disabled={value == null}
            onClick={onClear}
          >
            {clearLabel ?? t('Clear')}
          </Button>
        )}
      </Stack>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {t('Recent colours')}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          data-testid={`${testId}-palette`}
          sx={{ mt: 1 }}
        >
          {slots.map((hex, index) =>
            hex == null ? (
              <Box
                key={`empty-${index}`}
                data-testid="PaletteSlotEmpty"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              />
            ) : (
              <Box
                key={hex}
                component="button"
                type="button"
                aria-label={t('Use {{hex}}', { hex })}
                data-testid={`PaletteSlot-${hex}`}
                onClick={() => commitHex(hex)}
                sx={{
                  width: 28,
                  height: 28,
                  p: 0,
                  borderRadius: '50%',
                  bgcolor: hex,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {hex === draft && (
                  <CheckIcon
                    data-testid="PaletteSlotSelected"
                    sx={{ fontSize: 16, color: 'background.paper' }}
                  />
                )}
              </Box>
            )
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
