import { X } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement } from 'react'

import { Button } from '@core/shared/ui-modern/components/button'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal
} from '@core/shared/ui-modern/components/dialog'

import { CategoryGrid } from '../CategoryGrid'
import { LanguageSelector } from '../LanguageSelector'
import { QuickList } from '../QuickList'
import { SearchResultsLayout } from '../SearchResultsLayout'

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
  onClearSearch: () => void
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
  isTrendingFallback,
  onClearSearch
}: SearchOverlayProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const trendingTitle = isTrendingFallback
    ? t('Popular Searches')
    : t('Trending Searches')
  const closeButtonClass =
    'rounded-full text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/50 [&_svg]:size-5'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPortal>
        <DialogOverlay className="blured-bg bg-stone-900/5" />
        <div className="fixed inset-x-0 top-0 z-[60] mr-3 pointer-events-none">
          <div className="responsive-container flex h-[100px] items-center justify-end lg:h-[200px]">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              aria-label={t('Close search')}
              tabIndex={0}
              className={`${closeButtonClass} pointer-events-auto`}
            >
              <X className="drop-shadow-xs" />
            </Button>
          </div>
        </div>
        <DialogContent
          ref={containerRef}
          onBlur={onBlur}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          showCloseButton={false}
          className="search-overlay-scroll fixed inset-x-0 top-[100px] bottom-0 left-0 max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain border-0 bg-stone-900/5 p-0 lg:top-[159px]"
          data-testid="SearchOverlay"
        >
          <div className="mx-auto w-full max-w-screen-2xl px-4 pt-8 pb-10 md:px-12 md:pt-12 md:pb-16">
            {!hasQuery ? (
              <div className="flex flex-col gap-6 md:gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                  <div className="flex-1">
                    <QuickList
                      title={trendingTitle}
                      items={trendingSearches}
                      onSelect={onSelectQuickValue}
                      isLoading={isTrendingLoading}
                    />
                  </div>
                  <div className="w-full flex-shrink-0 md:w-90">
                    <div className="mb-3 block text-sm font-semibold tracking-wider text-stone-600 uppercase">
                      {t('Search Filters')}
                    </div>
                    <LanguageSelector />
                  </div>
                </div>
                <CategoryGrid onCategorySelect={onSelectQuickValue} />
              </div>
            ) : (
              <SearchResultsLayout
                searchQuery={searchQuery}
                onSelectQuickValue={onSelectQuickValue}
                languageId={languageId}
                onClearSearch={onClearSearch}
              />
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
