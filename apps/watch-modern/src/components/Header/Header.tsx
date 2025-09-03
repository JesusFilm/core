"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, ChevronDown, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function Header() {
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ]

  const currentLanguage = languages.find(lang => pathname?.startsWith(`/${lang.code}`)) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    const newPath = pathname?.replace(/^\/[a-z]{2}/, `/${langCode}`) || `/${langCode}`
    router.push(newPath)
    setIsLanguageMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">JFP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Jesus Film Project</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/resources"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Resources
            </Link>
            <Link
              href="/journeys"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Journeys
            </Link>
            <Link
              href="/videos"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Videos
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Language Switch */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{currentLanguage.flag}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <span className="mr-3">{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <Container>
          <nav className="flex justify-around py-3">
            <Link
              href="/resources"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Resources
            </Link>
            <Link
              href="/journeys"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Journeys
            </Link>
            <Link
              href="/videos"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Videos
            </Link>
          </nav>
        </Container>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <Container>
            <div className="py-4">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search videos, films, and series..."
                    className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-300 bg-white text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors shadow-sm"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
