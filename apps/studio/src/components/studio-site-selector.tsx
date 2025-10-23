import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { type FC, useEffect, useRef, useState } from 'react'

interface StudioSiteSelectorProps {
  onNavigateHome?: () => void
  className?: string
}

const jesusFilmLinks = [
  {
    href: 'https://www.jesusfilm.org/watch',
    label: 'Videos'
  },
  {
    href: 'https://www.jesusfilm.org/resources/strategies/digital/jesus-film-project-app/',
    label: 'App'
  }
]

const partnerSites = [
  {
    href: 'https://nextstep.is',
    label: 'NextStep.is'
  },
  {
    href: 'https://churchinvites.com',
    label: 'ChurchInvites.com'
  }
]

export const StudioSiteSelector: FC<StudioSiteSelectorProps> = ({
  onNavigateHome,
  className
}) => {
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false)
  const siteMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isSiteMenuOpen) return

    function handleOutsideClick(event: MouseEvent): void {
      if (
        siteMenuRef.current != null &&
        event.target instanceof Node &&
        !siteMenuRef.current.contains(event.target)
      ) {
        setIsSiteMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsSiteMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isSiteMenuOpen])

  const handleNavigateHome = (): void => {
    setIsSiteMenuOpen(false)
    onNavigateHome?.()
  }

  const handleToggleSiteMenu = (): void => {
    setIsSiteMenuOpen((previous) => !previous)
  }

  return (
    <div
      className={`flex items-center gap-1 ${className ?? ''}`.trim()}
      ref={siteMenuRef}
    >
      <button
        type="button"
        onClick={handleNavigateHome}
        className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
      >
        <Image
          src="/jesusfilm-sign.svg"
          alt="Jesus Film Project"
          width={24}
          height={24}
          className="h-6 w-auto"
        />
        <span className="text-2xl font-bold text-foreground">Studio</span>
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggleSiteMenu}
          aria-expanded={isSiteMenuOpen}
          aria-haspopup="menu"
          aria-controls="studio-site-menu"
          className="flex items-center justify-center rounded-md border border-transparent p-1 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isSiteMenuOpen ? 'rotate-180' : ''}`}
          />
          <span className="sr-only">Open site selector</span>
        </button>
        {isSiteMenuOpen && (
          <div
            id="studio-site-menu"
            role="menu"
            aria-label="Jesus Film Project websites"
            className="absolute left-0 z-50 mt-2 w-64 rounded-lg border border-border bg-popover shadow-lg"
          >
            <div className="px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Jesus Film Project
              </p>
              <ul className="mt-2 space-y-1">
                {jesusFilmLinks.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-foreground"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsSiteMenuOpen(false)}
                      role="menuitem"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="my-3 h-px bg-border" role="separator" />
              <ul className="space-y-1">
                {partnerSites.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-foreground"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsSiteMenuOpen(false)}
                      role="menuitem"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
