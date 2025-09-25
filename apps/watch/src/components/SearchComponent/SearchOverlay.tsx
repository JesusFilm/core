import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal
} from '@ui/components/dialog'
import { useTranslation } from 'next-i18next'
import { FocusEvent, ReactElement } from 'react'

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
          <div className="max-w-screen-2xl px-4 md:px-12 pt-8 md:pt-12 pb-10 md:pb-16">
            {!hasQuery ? (
              <div className="flex flex-col gap-6 md:gap-8">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex-1">
                    <QuickList
                      title={trendingTitle}
                      items={trendingSearches}
                      onSelect={onSelectQuickValue}
                      isLoading={isTrendingLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="block mb-3 font-semibold text-xs uppercase tracking-wider text-gray-600">
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
              />
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
