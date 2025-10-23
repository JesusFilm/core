import { ChevronDown, History, Settings } from 'lucide-react'
import Image from 'next/image'
import type { FC, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '../ui/button'

export interface TokenSummary {
  formattedTotal: string
  estimatedCost: string
}

interface EditorHeaderProps {
  onNavigateHome: () => void
  onNavigatePlan: () => void
  onToggleSessions: () => void
  onOpenSettings: () => void
  tokenSummary: TokenSummary | null
  isTokensUpdated: boolean
  children?: ReactNode
}

export const EditorHeader: FC<EditorHeaderProps> = ({
  onNavigateHome,
  onNavigatePlan,
  onToggleSessions,
  onOpenSettings,
  tokenSummary,
  isTokensUpdated,
  children
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
    onNavigateHome()
  }

  const handleToggleSiteMenu = (): void => {
    setIsSiteMenuOpen((previous) => !previous)
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

  return (
    <header className="border-b border-border bg-background backdrop-blur" data-id="Header">
      <div className="container mx-auto px-4 py-6" data-id="HeaderContainer">
        <div className="flex items-center justify-between" data-id="HeaderRow">
          <div className="flex items-center gap-4" data-id="HeaderBranding">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" ref={siteMenuRef}>
                <button
                  type="button"
                  onClick={handleNavigateHome}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
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
              <span className="text-muted-foreground">{'>'}</span>
              <button
                onClick={onNavigatePlan}
                className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Plan
              </button>
              <span className="text-muted-foreground">{'>'}</span>
              <span className="text-lg font-medium text-foreground">Edit</span>
            </div>
          </div>
          <div className="flex items-center gap-4" data-id="HeaderActions">
            {tokenSummary && (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                  isTokensUpdated ? 'bg-red-500 text-white' : 'bg-muted'
                }`}
              >
                <span className={isTokensUpdated ? 'text-white' : 'text-muted-foreground'}>
                  Tokens:
                </span>
                <span className="font-medium">{tokenSummary.formattedTotal}</span>
                <span className={isTokensUpdated ? 'text-white' : 'text-muted-foreground'}>•</span>
                <span className="font-medium">${tokenSummary.estimatedCost}</span>
              </div>
            )}
            <Button
              variant="ghost"
              className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
              onClick={onToggleSessions}
            >
              <History className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
              <span className="sr-only">Sessions</span>
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
              onClick={onOpenSettings}
            >
              <Settings className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
              <span className="sr-only">Settings</span>
            </Button>
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}
