import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement, RefObject, useMemo } from 'react'

import { AlgoliaVideoGrid } from '../../VideoGrid/AlgoliaVideoGrid'
import { VideoGrid } from '../../VideoGrid/VideoGrid'

import { LanguageFilter } from './LanguageFilter'

interface SearchOverlayProps {
  open: boolean
  hasQuery: boolean
  onBlur: (event: FocusEvent<HTMLDivElement>) => void
  onSelectQuickValue: (value: string) => void
  containerRef: RefObject<HTMLDivElement | null>
  languageId?: string
}

export function SearchOverlay({
  open,
  hasQuery,
  onBlur,
  onSelectQuickValue,
  containerRef,
  languageId
}: SearchOverlayProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const popularSearches = useMemo(
    () =>
      (t('popularSearches', { returnObjects: true }) as string[] | undefined) ??
      [],
    [t]
  )

  const popularCategories = useMemo(
    () =>
      (t('popularCategories', { returnObjects: true }) as string[] | undefined) ??
      [],
    [t]
  )

  return (
    <Box
      ref={containerRef}
      role="dialog"
      aria-modal="false"
      tabIndex={-1}
      onBlur={onBlur}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: { xs: 100, lg: 159 },
        bottom: 0,
        backgroundColor: 'rgba(6, 10, 25, 0.82)',
        backdropFilter: 'blur(26px)',
        zIndex: (theme) => theme.zIndex.appBar - 1,
        overflowY: 'auto',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.2s ease-in-out'
      }}
      data-testid="WatchSearchOverlay"
    >
      <Container
        maxWidth="xxl"
        sx={{
          px: { xs: 4, md: 12 },
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 }
        }}
      >
        <Stack spacing={{ xs: 6, md: 8 }}>
          <QuickList
            title={t('Popular Searches')}
            items={popularSearches}
            onSelect={onSelectQuickValue}
          />
          <QuickList
            title={t('Popular Categories')}
            items={popularCategories}
            onSelect={onSelectQuickValue}
          />
          <LanguageFilter />
          {hasQuery ? (
            <AlgoliaVideoGrid
              variant="contained"
              languageId={languageId}
              showLoadMore
            />
          ) : (
            <VideoGrid loading variant="contained" />
          )}
        </Stack>
      </Container>
    </Box>
  )
}

interface QuickListProps {
  title: string
  items: string[]
  onSelect: (value: string) => void
}

function QuickList({ title, items, onSelect }: QuickListProps): ReactElement | null {
  if (items.length === 0) return null

  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 3 }}
      >
        {title}
      </Typography>
      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            color="secondary"
            variant="outlined"
            onClick={() => onSelect(item)}
            onMouseDown={(event) => event.preventDefault()}
            sx={{ borderRadius: 999, fontWeight: 500 }}
          />
        ))}
      </Stack>
    </Box>
  )
}
