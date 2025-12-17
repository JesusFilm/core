import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement } from 'react'

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal
} from '@core/shared/ui-modern/components/dialog'

import { CategoryGrid } from './CategoryGrid'
import { LanguageSelector } from './LanguageSelector'
import { QuickList } from './QuickList'
import { SearchResultsLayout } from './SearchResultsLayout'

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPortal>
        <DialogOverlay className="blured-bg bg-stone-900/5" />
        <DialogContent
          ref={containerRef}
          onBlur={onBlur}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="[&>button]:scale-175 fixed inset-x-0 bottom-0 left-0 top-[100px] max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain border-0 bg-stone-900/5 p-0 lg:top-[159px] [&>button]:right-12 [&>button]:cursor-pointer"
          data-testid="SearchOverlay"
        >
          <div className="mx-auto w-full max-w-screen-2xl px-4 pb-10 pt-8 md:px-12 md:pb-16 md:pt-12">
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
                  <div className="md:w-90 w-full flex-shrink-0">
                    <div className="mb-3 block text-sm font-semibold uppercase tracking-wider text-stone-600">
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
