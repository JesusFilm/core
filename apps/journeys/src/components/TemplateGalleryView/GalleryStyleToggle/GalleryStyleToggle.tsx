import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'

import { galleryStyles } from '../galleryStyles'

interface GalleryStyleToggleProps {
  value: string
  onChange: (id: string) => void
}

/**
 * Prototype-only control bar pinned to the top of the gallery page. Lets
 * us flip between the style presets in `galleryStyles` to preview looks.
 * Styled neutrally (translucent, blurred) so it stays legible on every
 * preset background.
 */
export function GalleryStyleToggle({
  value,
  onChange
}: GalleryStyleToggleProps): ReactElement {
  const { t } = useTranslation('apps-journeys')

  const activeStyle =
    galleryStyles.find((style) => style.id === value) ?? galleryStyles[0]

  function handleChange(
    _event: MouseEvent<HTMLElement>,
    nextValue: string | null
  ): void {
    // Exclusive groups emit null when the active button is re-clicked;
    // ignore it so a style always stays selected.
    if (nextValue == null) return
    onChange(nextValue)
  }

  return (
    <Box
      data-testid="GalleryStyleToggle"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 'appBar',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ px: { xs: 2, md: 4 }, py: 1.5 }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(0,0,0,0.6)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          {t('Style preview')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={value}
          onChange={handleChange}
          aria-label="Gallery style preview"
          sx={{ flexWrap: 'wrap' }}
        >
          {galleryStyles.map((style) => (
            <ToggleButton
              key={style.id}
              value={style.id}
              sx={{ textTransform: 'none', color: 'rgba(0,0,0,0.75)' }}
            >
              {style.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}
        >
          {activeStyle.description}
        </Typography>
      </Stack>
    </Box>
  )
}
