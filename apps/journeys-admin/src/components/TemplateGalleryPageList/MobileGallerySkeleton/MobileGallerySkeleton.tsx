import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

const SKELETON_CHIPS = 4
const SKELETON_ROWS = 5

/**
 * Loading placeholder for the mobile gallery. The fixed titles — the
 * "Collections" header and the "All Templates" filter title — render for real
 * (matching the live layout's padding/sizes) so they don't shift in on load;
 * only the data-dependent parts (the create button, the template count, the
 * chips, and the list rows) are skeletons.
 */
export function MobileGallerySkeleton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="MobileGallerySkeleton">
      {/* Collections header — fixed title; create button is a placeholder. */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3, pl: { xs: 2, md: 0 } }}
      >
        <Typography variant="h4">{t('Collections')}</Typography>
        <Skeleton
          variant="rounded"
          width={32}
          height={32}
          sx={{ flexShrink: 0 }}
        />
      </Stack>

      {/* Chip row */}
      <Stack
        direction="row"
        spacing={3}
        sx={{ mx: { xs: -2, sm: -10 }, px: 2, py: 1.5, overflow: 'hidden' }}
      >
        {Array.from({ length: SKELETON_CHIPS }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width={250}
            height={72}
            sx={{ flexShrink: 0, borderRadius: 2 }}
          />
        ))}
      </Stack>

      {/* Filter strip — fixed "All Templates" title; count not known yet.
          Mirrors MobileFilterHeaderStrip's padding/min-height so it doesn't
          shift when the real strip takes over. */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ py: 1, pl: { xs: 2, md: 0 }, minHeight: 48 }}
      >
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('All Templates')}
          </Typography>
          <Skeleton variant="text" width={80} />
        </Stack>
      </Stack>

      {/* List rows */}
      <Stack
        sx={{
          mx: { xs: -2, sm: -10 },
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              p: 1,
              borderBottom: index < SKELETON_ROWS - 1 ? 1 : 0,
              borderColor: 'divider'
            }}
          >
            <Skeleton
              variant="rounded"
              width={80}
              height={60}
              sx={{ flexShrink: 0, borderRadius: 1 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
