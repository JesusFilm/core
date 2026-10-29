import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { CampaignPaletteColorPicker } from '../CampaignPaletteColorPicker'
import { ValueIndicator } from '../ValueIndicator'

export interface ColourRow<K extends string = string> {
  key: K
  label: string
  /** The colour set on the block, or null when it follows the band or theme. */
  value: string | null
  /** What the row shows while it follows the band or theme. */
  inherited: string
}

interface ColourRowsProps<K extends string> {
  rows: readonly ColourRow<K>[]
  /** Names the list for assistive technology. */
  label: string
  /** Row test ids are `${rowTestId}-${key}`. */
  rowTestId: string
  pickerTestId: string
  /** One call per commit of the selected row's picker. */
  onCommit: (key: K, hex: string) => void
  /** Offered when the rows may inherit; Reset writes null. */
  onReset?: (key: K) => void
  /**
   * Show where each value comes from. Off for rows that cannot inherit (the
   * Theme's own colours), where the dot could only ever say "set".
   */
  showIndicator?: boolean
}

/**
 * A list of colour rows, each with a swatch, its value and the dot that says
 * where the value comes from — orange when inherited from the band or theme,
 * blue when set on the block (unless `showIndicator` is off) — and the palette
 * picker of the selected row below, whose Reset writes null.
 */
export function ColourRows<K extends string>({
  rows,
  label,
  rowTestId,
  pickerTestId,
  onCommit,
  onReset,
  showIndicator = true
}: ColourRowsProps<K>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [selectedKey, setSelectedKey] = useState(rows[0].key)
  const selected = rows.find((row) => row.key === selectedKey) ?? rows[0]

  return (
    <Stack spacing={4}>
      <List dense disablePadding aria-label={label}>
        {rows.map((row) => (
          <ListItemButton
            key={row.key}
            selected={selected.key === row.key}
            onClick={() => setSelectedKey(row.key)}
            data-testid={`${rowTestId}-${row.key}`}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                mr: 3,
                borderRadius: '50%',
                bgcolor: row.value ?? row.inherited,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
            <ListItemText
              primary={row.label}
              secondary={row.value ?? t('Inherited')}
            />
            {showIndicator && (
              <ValueIndicator
                source={row.value == null ? 'inherited' : 'set'}
              />
            )}
          </ListItemButton>
        ))}
      </List>
      <CampaignPaletteColorPicker
        key={selected.key}
        label={selected.label}
        value={selected.value}
        fallback={selected.inherited}
        onCommit={(hex) => onCommit(selected.key, hex)}
        onClear={onReset != null ? () => onReset(selected.key) : undefined}
        clearLabel={t('Reset')}
        testId={pickerTestId}
      />
    </Stack>
  )
}
