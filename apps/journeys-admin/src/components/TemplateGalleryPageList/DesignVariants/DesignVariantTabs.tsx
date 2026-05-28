import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { ReactElement, SyntheticEvent } from 'react'

import { DESIGN_VARIANTS, DesignVariant, VARIANT_LABELS } from './types'

export interface DesignVariantTabsProps {
  /** Currently-active variant. */
  value: DesignVariant
  /** Called when the user picks a different variant. */
  onChange: (variant: DesignVariant) => void
}

/**
 * Design-variant tab strip for the templates panel. Renders a row of tabs —
 * one per `DesignVariant` — above the collections layout so the team can
 * flip between the production chip-row design and the exploration variants
 * side-by-side (NES-1695 design lab). Desktop-only: variants target
 * desktop folder-system layouts, and mobile keeps the production layout.
 */
export function DesignVariantTabs({
  value,
  onChange
}: DesignVariantTabsProps): ReactElement {
  function handleChange(_event: SyntheticEvent, newIndex: number): void {
    onChange(DESIGN_VARIANTS[newIndex])
  }

  const activeIndex = DESIGN_VARIANTS.indexOf(value)

  return (
    <Box
      data-testid="DesignVariantTabs"
      sx={{
        // Design-lab strip — only useful at desktop widths where the
        // variant layouts are tuned. Mobile always shows the production
        // chip-row design (variants render through DesignVariantSwitch
        // which falls back to original on xs/sm).
        display: { xs: 'none', md: 'block' },
        mb: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ flexShrink: 0, lineHeight: 1 }}
        >
          Design preview
        </Typography>
        <Tabs
          value={activeIndex}
          onChange={handleChange}
          aria-label="Collection layout design variants"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              typography: 'subtitle2'
            }
          }}
        >
          {DESIGN_VARIANTS.map((variant) => (
            <Tab
              key={variant}
              label={VARIANT_LABELS[variant]}
              data-testid={`DesignVariantTab-${variant}`}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  )
}
