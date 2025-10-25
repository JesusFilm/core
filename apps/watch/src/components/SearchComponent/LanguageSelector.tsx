import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@ui/components/command'
import { Check, ChevronsUpDown, Globe } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { languageRefinementProps } from '@core/journeys/ui/algolia/SearchBarProvider'

import { cn } from '../../libs/cn'
import { useLanguages } from '../../libs/useLanguages'
import { Button } from '../ui/button'

interface LanguageOption {
  englishName: string
  nativeName: string
  value: string
  isRefined: boolean
  count?: number
}

// Single-select language filter component
export function LanguageSelector(): JSX.Element {
  const { t } = useTranslation('apps-watch')
  const { items, refine } = useRefinementList(languageRefinementProps)
  const { languages, isLoading: languagesLoading } = useLanguages()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Combine Algolia refinement data with full language information
  const languageOptions = useMemo(() => {
    if (languagesLoading || !languages.length) return []

    // Create a map of language names to language data
    const languageMap = new Map(
      languages.map((lang) => [lang.englishName?.value, lang])
    )

    // Build options from refinement items, enriched with native names
    const options = items.map((item): LanguageOption => {
      const languageData = languageMap.get(item.label)
      return {
        englishName: item.label,
        nativeName: languageData?.nativeName?.value || item.label,
        value: item.value,
        isRefined: item.isRefined,
        count: item.count
      }
    })

    return options.sort((a, b) => a.englishName.localeCompare(b.englishName))
  }, [items, languages, languagesLoading])

  const selectedLanguages = useMemo(
    () => languageOptions.filter((item) => item.isRefined),
    [languageOptions]
  )

  const handleLanguageSelect = (currentValue: string) => {
    // Clear all existing selections first (single-select behavior)
    selectedLanguages.forEach((lang) => {
      if (lang.value !== currentValue) {
        refine(lang.value)
      }
    })
    // Then select the new language if it's not already selected
    if (!selectedLanguages.some(lang => lang.value === currentValue)) {
      refine(currentValue)
    }
    setOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [open])

  const getDisplayValue = () => {
    if (selectedLanguages.length === 0) {
      return t('Search languages...')
    }
    return selectedLanguages[0].englishName
  }

  if (languagesLoading) {
    return (
      <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        disabled
        className="w-full justify-between opacity-50 h-12 px-4"
      >
          <div className="flex items-center">
            <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{t('Loading languages...')}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full justify-between cursor-pointer h-12"
      >
        <div className="flex items-center">
          <Globe className="mr-2 h-5 w-5 text-muted-foreground" />
          <span className="truncate text-base font-medium">{getDisplayValue()}</span>
        </div>
        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-[200] mt-1 bg-popover border border-border rounded-md shadow-md">
          <Command>
            <CommandInput ref={searchInputRef} placeholder={t('Search languages...')} />
            <CommandList className="max-h-[60svh]">
              <CommandEmpty>{t('No languages found.')}</CommandEmpty>
              <CommandGroup>
                {languageOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.englishName} ${option.nativeName}`}
                    onSelect={() => handleLanguageSelect(option.value)}
                    className="flex items-center justify-between cursor-pointer px-4 py-2 hover:bg-white/5"
                  >
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-base">{option.englishName}</span>
                      {option.nativeName !== option.englishName && (
                        <span className="text-sm text-muted-foreground">
                          {option.nativeName}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        'ml-2 h-5 w-5',
                        option.isRefined ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
