import { Check, ChevronDown } from 'lucide-react'
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
        label: 'Video Library',
        description: '/watch'
      },
      {
        label: 'Sharing Studio',
        description: '/studio',
        isSelected: true,
        onSelect: handleNavigateHome
      },
      {
        href: 'https://www.jesusfilm.org/resources/strategies/digital/jesus-film-project-app/',
        label: 'Mobile App',
        description: '/app'
      }
    ],
    [handleNavigateHome]
  )

  const closeMenu = (): void => {
    setIsSiteMenuOpen(false)
  }

  const baseMenuItemClasses =
    'flex w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer'

  return (
    <div
      className={`relative flex items-center gap-1 ${className ?? ''}`.trim()}
      ref={siteMenuRef}
    >
      <button
        type="button"
        onClick={handleToggleSiteMenu}
        aria-expanded={isSiteMenuOpen}
        aria-haspopup="menu"
        aria-controls="studio-site-menu"
        className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 transition-colors hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Image
          src="/studio/jesusfilm-sign.svg"
          alt="Jesus Film Project"
          width={24}
          height={24}
          className="h-6 w-auto"
        />
        <span className="text-2xl font-bold text-foreground">Studio</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isSiteMenuOpen ? 'rotate-180' : ''}`}
        />
        <span className="sr-only">Open site selector</span>
      </button>
      {isSiteMenuOpen && (
        <div
          id="studio-site-menu"
          role="menu"
          aria-label="JesusFilm.org websites"
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-popover shadow-lg"
        >
          <div className="px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              JesusFilm.org
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
                      <span className="flex flex-col items-start gap-1">
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </span>
                      {isSelected ? (
                        <Check aria-hidden="true" className="h-4 w-4 text-primary" />
                      ) : null}
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
                      <span className="flex flex-col items-start gap-1">
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </span>
                      {isSelected ? (
                        <Check aria-hidden="true" className="h-4 w-4 text-primary" />
                      ) : null}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="my-4 h-px bg-border" role="separator" />
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Our Other Projects
            </p>
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
                    <span className="flex flex-col items-start gap-1">
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </span>
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
