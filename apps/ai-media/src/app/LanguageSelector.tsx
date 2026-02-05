'use client'

import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { languageSlugs } from '@core/prisma/languages/__generated__/languageSlugs'

function formatSlugFallback(id: string): string {
  const slug = languageSlugs[id]
  if (!slug) return ''
  return slug
    .replace(/\.html$/i, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

type LanguageOption = {
  id: string
  englishLabel: string
  nativeLabel: string
}

interface LanguageSelectorProps {
  value: string
  options: LanguageOption[]
  className?: string
}

export function LanguageSelector({
  value,
  options,
  className
}: LanguageSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loadedOptions, setLoadedOptions] =
    useState<LanguageOption[]>(options)
  const [searchValue, setSearchValue] = useState('')
  const shellRef = useRef<HTMLSpanElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const selectedLabel = useMemo(
    () =>
      loadedOptions.find((option) => option.id === value)?.englishLabel ??
      loadedOptions[0]?.englishLabel ??
      value ??
      '',
    [loadedOptions, value]
  )

  useEffect(() => {
    if (typeof document === 'undefined') return
    const loading = isLoading || isPending
    if (loading) {
      document.documentElement.dataset.loading = 'true'
    } else {
      delete document.documentElement.dataset.loading
    }
  }, [isLoading, isPending])

  useEffect(() => {
    setIsLoading(false)
  }, [value])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearchValue('')
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!shellRef.current) return
      if (!shellRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.select()
    }
  }, [isOpen])

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages', {
          signal: controller.signal
        })

        if (!response.ok) return
        const payload = (await response.json()) as string[][]

        const nextOptions = payload.map((entry) => {
          const [languageIdSlugNative, ...names] = entry
          const [id] = languageIdSlugNative.split(':')
          const englishName =
            names.find((name) => name.startsWith('529:'))?.split(':')[1] ?? ''
          const nativeLabel =
            languageIdSlugNative.split(':').slice(2).join(':') ?? ''

          return {
            id,
            englishLabel: englishName.trim() || formatSlugFallback(id),
            nativeLabel: nativeLabel.trim()
          }
        })
          .filter(
            (language) =>
              language.englishLabel.trim().length > 0 &&
              !/^\d+$/.test(language.englishLabel.trim())
          )
          .sort((a, b) => a.englishLabel.localeCompare(b.englishLabel))

        if (isActive && nextOptions.length > 0) {
          setLoadedOptions(nextOptions)
        }
      } catch {
        // keep initial options
      }
    }

    fetchLanguages()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? '')
    const nextValue = event.target.value

    if (nextValue) {
      nextParams.set('languageId', nextValue)
    } else {
      nextParams.delete('languageId')
    }

    const queryString = nextParams.toString()
    setIsLoading(true)
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    })
  }

  return (
    <span className="control-select-shell" ref={shellRef}>
      <button
        type="button"
        className={className}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="control-select-text">{selectedLabel}</span>
        <span className="control-chevron" aria-hidden="true" />
      </button>
      {(isLoading || isPending) && (
        <span className="control-loading" aria-live="polite">
          Loading…
        </span>
      )}
      {isOpen && (
        <div className="control-dropdown" role="listbox" aria-label="Language">
          <div className="control-search">
            <input
              type="search"
              value={searchValue}
              ref={searchInputRef}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search languages..."
              aria-label="Search languages"
              className="control-search-input"
            />
          </div>
          {loadedOptions
            .filter((option) => {
              const query = searchValue.trim().toLowerCase()
              if (!query) return true
              return (
                option.englishLabel.toLowerCase().includes(query) ||
                option.nativeLabel.toLowerCase().includes(query)
              )
            })
            .map((option) => {
            const isSelected = option.id === value
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`control-option${isSelected ? ' is-selected' : ''}`}
                onClick={() => {
                  setIsOpen(false)
                  setSearchValue('')
                  handleChange({
                    target: { value: option.id }
                  } as ChangeEvent<HTMLSelectElement>)
                }}
              >
                <span className="control-option-english">
                  {option.englishLabel}
                </span>
                {option.nativeLabel &&
                  option.nativeLabel !== option.englishLabel && (
                  <span className="control-option-native">
                    {option.nativeLabel}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </span>
  )
}
