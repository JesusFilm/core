import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement } from 'react'

import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@ui/components/dialog'

import { CategoryGrid } from './CategoryGrid'
import { QuickList } from './QuickList'
import { SearchResultsLayout } from './SearchResultsLayout'
import { LanguageSelector } from './LanguageSelector'

export interface SearchOverlayProps {
  open: boolean
  hasQuery: boolean
  searchQuery: string
  onBlur: (event: FocusEvent<HTMLDivElement>) => void
  onSelectQuickValue: (value: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  languageId?: string
  onClose: () => void
  trendingSearches: string[]
  isTrendingLoading: boolean
  isTrendingFallback: boolean
}

export function SearchOverlay({
  open,
  hasQuery,
  searchQuery,
  onBlur,
  onSelectQuickValue,
  containerRef,
  languageId,
  onClose,
  trendingSearches,
  isTrendingLoading,
  isTrendingFallback
}: SearchOverlayProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const trendingTitle = isTrendingFallback
    ? t('Popular Searches')
    : t('Trending Searches')

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPortal>
        <DialogOverlay className="blured-bg" />
        <DialogContent
          ref={containerRef}
          onBlur={onBlur}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="
            fixed inset-x-0 bottom-0 top-[100px] lg:top-[159px] max-w-none
            overflow-y-auto overscroll-contain p-0 border-0
            translate-x-0 translate-y-0 left-0
          "
          data-testid="SearchOverlay"
        >
          <Container
            maxWidth="xxl"
            sx={{
              px: { xs: 4, md: 12 },
              pt: { xs: 8, md: 12 },
              pb: { xs: 10, md: 16 }
            }}
          >
            {!hasQuery ? (
              <Stack spacing={{ xs: 6, md: 8 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 4, md: 6 }
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <QuickList
                      title={trendingTitle}
                      items={trendingSearches}
                      onSelect={onSelectQuickValue}
                      isLoading={isTrendingLoading}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 3, fontWeight: 600 }}
                    >
                      {t('Search Filters')}
                    </Typography>
                    <LanguageSelector />
                  </Box>
                </Box>
                <CategoryGrid onCategorySelect={onSelectQuickValue} />
              </Stack>
            ) : (
              <SearchResultsLayout
                searchQuery={searchQuery}
                onSelectQuickValue={onSelectQuickValue}
                languageId={languageId}
              />
            )}
          </Container>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
