import { Globe } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'
import { Button } from '@core/shared/ui-modern/components/button'

import { useFullscreen } from '../../libs/hooks'
import { usePlayer } from '../../libs/playerContext/PlayerContext'
import { DialogLangSwitch } from '../DialogLangSwitch'
import { useFloatingSearchOverlay } from '../SearchComponent/hooks/useFloatingSearchOverlay'
import { SearchOverlay } from '../SearchComponent/SearchOverlay'
import { SimpleSearchBar } from '../SearchComponent/SimpleSearchBar'

interface ContentHeaderProps {
  languageSlug?: string
  isPersistent?: boolean
  languageId?: string
}

export function ContentHeader({
  languageSlug,
  isPersistent = false,
  languageId
}: ContentHeaderProps): ReactElement {
  const {
    state: { play, active, loading },
    dispatch: dispatchPlayer
  } = usePlayer()
  const isFullscreen = useFullscreen()
  const visible = isPersistent || ((!play || active || loading) && !isFullscreen)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previousPlayState, setPreviousPlayState] = useState<boolean>(false)

  const {
    searchInputRef,
    overlayRef,
    isSearchActive,
    hasQuery,
    searchQuery,
    searchValue,
    loading: searchLoading,
    handleSearch,
    handleSearchFocus,
    handleSearchBlur,
    handleOverlayBlur,
    handleQuickSelect,
    handleCloseSearch,
    handleClearSearch,
    trendingSearches,
    isTrendingLoading,
    isTrendingFallback
  } = useFloatingSearchOverlay()

  const handleOpenDialog = (): void => {
    setPreviousPlayState(play)
    setIsDialogOpen(true)
    dispatchPlayer({ type: 'SetPlay', play: false })
  }

  const handleCloseDialog = (): void => {
    setIsDialogOpen(false)
    dispatchPlayer({ type: 'SetPlay', play: previousPlayState })
  }

  const headerIconButtonClass =
    'rounded-full text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/50 [&_svg]:size-5'
  const headerIconClass = 'drop-shadow-xs'

  return (
    <SearchBarProvider>
      <div
        data-testid="ContentHeader"
        className={`responsive-container absolute top-0 right-0 left-0 z-[99] flex h-[100px] w-full flex-row items-center justify-between gap-4 transition-opacity duration-[225ms] lg:h-[200px] ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${visible ? 'delay-0' : 'delay-[600ms]'}`}
      >
        {/* Logo */}
        <NextLink
          href={
            languageSlug != null && languageSlug !== 'english'
              ? `/${languageSlug}.html`
              : '/'
          }
          locale={false}
          aria-label="Go to Watch home"
          className="flex-shrink-0"
        >
          <Image
            src="/watch/images/jesusfilm-sign.svg"
            alt="Jesus Film Project"
            width={70}
            height={70}
            className="max-w-[50px] lg:max-w-[70px]"
          />
        </NextLink>

        {/* Search bar */}
        <div className="flex-1 max-w-[60%] md:max-w-[600px]">
          <SimpleSearchBar
            loading={searchLoading && hasQuery}
            value={searchValue}
            onSearch={handleSearch}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            props={{ inputRef: searchInputRef }}
          />
        </div>

        {/* Language selector */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleOpenDialog}
            variant="ghost"
            size="icon"
            data-testid="AudioLanguageButton"
            aria-label="select audio language"
            tabIndex={isSearchActive ? -1 : 0}
            className={`${headerIconButtonClass} transition-opacity duration-200 ${
              isSearchActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <Globe className={headerIconClass} />
          </Button>
          <DialogLangSwitch open={isDialogOpen} handleClose={handleCloseDialog} />
        </div>
      </div>

      <SearchOverlay
        open={isSearchActive}
        hasQuery={hasQuery}
        searchQuery={searchQuery}
        onBlur={handleOverlayBlur}
        onSelectQuickValue={handleQuickSelect}
        containerRef={overlayRef}
        languageId={languageId}
        onClose={handleCloseSearch}
        trendingSearches={trendingSearches}
        isTrendingLoading={isTrendingLoading}
        isTrendingFallback={isTrendingFallback}
        onClearSearch={handleClearSearch}
      />
    </SearchBarProvider>
  )
}
