import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface StudioSiteSelectorProps {
  onNavigateHome?: () => void
  className?: string
}

interface SiteLink {
  href?: string
  label: string
  description: string
  isSelected?: boolean
  onSelect?: () => void
}

const partnerSites: SiteLink[] = [
  {
    href: 'https://nextstep.is',
    label: 'NextStep.is',
    description: 'Guide people toward their next step with Jesus.'
  },
  {
    href: 'https://churchinvites.com',
    label: 'ChurchInvites.com',
    description: 'Equip your church to invite neighbors personally.'
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

  const handleNavigateHome = useCallback((): void => {
    setIsSiteMenuOpen(false)
    onNavigateHome?.()
  }, [onNavigateHome])

  const handleToggleSiteMenu = (): void => {
    setIsSiteMenuOpen((previous) => !previous)
  }

  const jesusFilmLinks = useMemo<SiteLink[]>(
    () => [
      {
        href: 'https://www.jesusfilm.org/watch',
        label: 'Videos',
        description: 'Watch the story of Jesus in hundreds of languages.'
      },
      {
        label: 'Studio',
        description: 'Create ministry resources with AI assistance.',
        isSelected: true,
        onSelect: handleNavigateHome
      },
      {
        href: 'https://www.jesusfilm.org/resources/strategies/digital/jesus-film-project-app/',
        label: 'App',
        description: 'Carry the Jesus Film experience wherever you go.'
      }
    ],
    [handleNavigateHome]
  )

  const closeMenu = (): void => {
    setIsSiteMenuOpen(false)
  }

  const baseMenuItemClasses =
    'flex w-full flex-col items-start gap-1 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer'

  return (
    <div
      className={`relative flex items-center gap-1 ${className ?? ''}`.trim()}
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
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-popover shadow-lg"
        >
          <div className="px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Jesus Film Project
            </p>
            <ul className="mt-3 space-y-1">
              {jesusFilmLinks.map(({ href, label, description, isSelected, onSelect }) => (
                <li key={label}>
                  {href != null ? (
                    <a
                      className={`${baseMenuItemClasses} ${
                        isSelected
                          ? 'bg-muted text-foreground'
                          : 'text-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMenu}
                      role="menuitem"
                      aria-current={isSelected ? 'page' : undefined}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      aria-current={isSelected ? 'page' : undefined}
                      onClick={() => {
                        onSelect?.()
                      }}
                      className={`${baseMenuItemClasses} ${
                        isSelected
                          ? 'bg-muted text-foreground'
                          : 'text-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="my-4 h-px bg-border" role="separator" />
            <ul className="space-y-1">
              {partnerSites.map(({ href, label, description }) => (
                <li key={href}>
                  <a
                    className={`${baseMenuItemClasses} text-foreground hover:bg-muted hover:text-foreground`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
