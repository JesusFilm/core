import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { bulletListSx, mediaSlotSx, subHeadingSx } from '../styles'

/**
 * TemplateTypesSection — Section 1 of TemplateInfoPanel (NES-1538).
 *
 * Renders the Quick-Start variant FIRST (with the "RECOMMENDED" chip), then
 * the Regular variant. Mirrors Figma `39657-66822`. The ticket body lists
 * Regular first; the plan's Key Technical Decisions explicitly carry Figma
 * order as authoritative for this section.
 */
export function TemplateTypesSection(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack gap={3} data-testid="TemplateTypesSection">
      <Stack gap={1}>
        <Stack direction="row" gap={1} alignItems="center">
          <Typography sx={subHeadingSx}>{t('Quick-Start')}</Typography>
          <Chip
            label={t('RECOMMENDED')}
            size="small"
            sx={{
              bgcolor: '#DEDFE0',
              color: 'text.primary',
              borderRadius: 1,
              height: 'auto',
              fontFamily: 'Open Sans, sans-serif',
              fontWeight: 600,
              fontSize: 14,
              lineHeight: '20px',
              px: 1,
              py: 0.5,
              '& .MuiChip-label': { px: 0 }
            }}
          />
        </Stack>
        <Box component="ul" sx={bulletListSx}>
          <li>{t('Best for new or mobile users.')}</li>
          <li>{t('Easy to customize: step-by-step guided editing.')}</li>
          <li>{t('Requires setup.')}</li>
        </Box>
        <Box
          component="img"
          src="/assets/template-info/template-types-quick-start.png"
          alt={t('Quick-Start template guided editing UI — mobile-friendly')}
          width={333}
          height={185}
          loading="lazy"
          sx={mediaSlotSx}
        />
      </Stack>
      <Stack gap={1}>
        <Typography sx={subHeadingSx}>{t('Regular')}</Typography>
        <Box component="ul" sx={bulletListSx}>
          <li>{t('Best for experienced and desktop users.')}</li>
          <li>
            {t(
              'Template adapters will have full editor access from the beginning.'
            )}
          </li>
          <li>{t('No setup required.')}</li>
        </Box>
        <Box
          component="img"
          src="/assets/template-info/template-types-regular.png"
          alt={t(
            'Regular template editor interface — desktop multi-screen view'
          )}
          width={333}
          height={185}
          loading="lazy"
          sx={mediaSlotSx}
        />
      </Stack>
    </Stack>
  )
}
