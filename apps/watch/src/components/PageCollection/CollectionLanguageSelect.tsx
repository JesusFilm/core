import { Check, ChevronsUpDown, Globe } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ExtendedButton as Button } from '@core/shared/uimodern/components'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@core/shared/uimodern/components/command'
import { cn } from '@core/shared/uimodern/utils'

import { useLanguages } from '../../libs/useLanguages'
import { useVideo } from '../../libs/videoContext'
import { useWatch } from '../../libs/watchContext'

export function CollectionLanguageSelect(): JSX.Element | null {
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
  const {
    state: { videoAudioLanguageIds }
  } = useWatch()
  const { languages, isLoading } = useLanguages()
  const { variant } = useVideo()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const variantLanguageId = variant?.language.id

  const availableLanguages = useMemo(() => {
    if (videoAudioLanguageIds == null || videoAudioLanguageIds.length === 0)
      return []

    return languages.filter((language) =>
      videoAudioLanguageIds.includes(language.id)
    )
  }, [languages, videoAudioLanguageIds])

  const currentLanguage = useMemo(
    () =>
      availableLanguages.find((language) => language.id === variantLanguageId),
    [availableLanguages, variantLanguageId]
  )

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current != null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open) searchInputRef.current?.focus()
  }, [open])

  if (isLoading) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          role="combobox"
          disabled
          className="w-full flex items-center justify-between opacity-50 h-12 px-4 bg-stone-800/50 border-stone-700/50 text-white rounded-md"
        >
          <div className="flex items-center flex-1 min-w-0">
            <Globe className="mr-2 h-4 w-4 text-stone-400 shrink-0" />
            <span className="text-white">{t('Loading languages...')}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-stone-400" />
        </Button>
      </div>
    )
  }

  if (availableLanguages.length === 0) return null

  const buildLanguageHref = (languageSlug: string): string => {
    const baseSlug = variant?.slug?.split('/')[0]
    if (baseSlug == null) return `/watch/${languageSlug}.html`
    return `/watch/${encodeURIComponent(baseSlug)}.html/${languageSlug}.html`
  }

  const handleLanguageSelect = (languageSlug: string) => {
    setOpen(false)
    void router.push(buildLanguageHref(languageSlug))
  }

  const displayValue =
    currentLanguage?.displayName ?? t('Search languages...')

  return (
    <div className="relative" ref={containerRef} data-testid="CollectionLanguageSelect">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between cursor-pointer h-12 px-4 bg-stone-800/50 border-stone-700/50 hover:bg-stone-800/70 text-white rounded-md"
      >
        <div className="flex items-center flex-1 min-w-0">
          <Globe className="mr-2 h-5 w-5 text-stone-400 shrink-0" />
          <span className="truncate text-base font-medium text-white">
            {displayValue}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50 text-stone-400" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-[200] mt-1 px-3 bg-popover border border-border rounded-md shadow-md">
          <Command>
            <CommandInput
              ref={searchInputRef}
              placeholder={t('Search languages...')}
              className="focus:outline-none focus-visible:outline-none"
            />
            <CommandList className="max-h-[60svh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <CommandEmpty>{t('No languages found.')}</CommandEmpty>
              <CommandGroup>
                {availableLanguages.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.displayName} ${option.nativeName?.value ?? ''}`}
                    onSelect={() => handleLanguageSelect(option.slug)}
                    className="flex items-center justify-between cursor-pointer px-4 py-2 hover:bg-white/5"
                  >
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-base">
                        {option.displayName}
                      </span>
                      {option.nativeName?.value != null &&
                        option.nativeName.value !== option.displayName && (
                          <span className="text-sm text-muted-foreground">
                            {option.nativeName.value}
                          </span>
                        )}
                    </div>
                    <Check
                      className={cn(
                        'ml-2 h-5 w-5',
                        option.id === currentLanguage?.id
                          ? 'opacity-100'
                          : 'opacity-0'
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
