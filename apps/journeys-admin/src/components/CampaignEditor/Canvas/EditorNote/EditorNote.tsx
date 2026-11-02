import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

interface EditorNoteProps {
  children: ReactNode
  testId?: string
}

/**
 * Text the canvas shows to the author only: an empty-slot prompt, the
 * heading over a section's interface wording. One treatment everywhere, an
 * "Editor only" tag and muted italics, so it is never mistaken for text the
 * public page shows.
 */
export function EditorNote({
  children,
  testId = 'EditorNote'
}: EditorNoteProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      direction="row"
      spacing={1}
      data-testid={testId}
      sx={{
        alignItems: 'center',
        justifyContent: 'inherit',
        flexWrap: 'wrap',
        color: 'var(--campaign-band-muted)'
      }}
    >
      <Chip
        size="small"
        variant="outlined"
        label={t('Editor only')}
        sx={{
          height: 20,
          fontSize: 10,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'inherit',
          borderColor: 'currentColor',
          borderStyle: 'dashed'
        }}
      />
      <Typography variant="body2" component="span" sx={{ fontStyle: 'italic' }}>
        {children}
      </Typography>
    </Stack>
  )
}
