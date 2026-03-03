import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Lightning2 from '@core/shared/ui/icons/Lightning2'

interface QuickStartBadgeProps {
  /** When provided, expansion is controlled by the parent (e.g. hover on JourneyCard or TemplateGalleryCard). When omitted, the badge manages its own hover state. */
  hovered?: boolean
}

export function QuickStartBadge({
  hovered
}: QuickStartBadgeProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const [internalHovered, setInternalHovered] = useState(false)

  const isExpanded = hovered ?? internalHovered
  const isControlled = hovered !== undefined

  return (
    <Box
      onMouseEnter={isControlled ? undefined : () => setInternalHovered(true)}
      onMouseLeave={isControlled ? undefined : () => setInternalHovered(false)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#000000cc',
        borderRadius: { xs: 8, md: 11 },
        padding: { xs: 0.5, md: 1 },
        paddingRight: isExpanded ? { xs: 2, md: 3 } : { xs: 0.5, md: 1 },
        transition: 'padding 0.3s ease',
        boxShadow: '0 3px 4px 0 #0000004D',
        cursor: isControlled ? undefined : 'default'
      }}
    >
      <Box
        sx={{
          width: { xs: 16, md: 22 },
          height: { xs: 16, md: 22 },
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Lightning2 sx={{ fontSize: { xs: 14, md: 18 }, color: '#FFD700' }} />
      </Box>
      <Typography
        sx={{
          ml: isExpanded ? 1 : 0,
          maxWidth: isExpanded ? { xs: 60, md: 100 } : 0,
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s ease',
          color: '#FFD700',
          typography: 'overline2',
          fontSize: { xs: '0.65rem', md: '0.75rem' }
        }}
      >
        {t('Quick Start')}
      </Typography>
    </Box>
  )
}
