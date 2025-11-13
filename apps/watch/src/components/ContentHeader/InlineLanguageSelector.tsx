import { Check, ChevronsUpDown, Globe } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

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
import { useWatch } from '../../libs/watchContext'
import { useLanguageActions } from '../../libs/watchContext/useLanguageActions'

export function InlineLanguageSelector(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const {
    state: { audioLanguageId, videoAudioLanguageIds }
  } = useWatch()
  const { updateAudioLanguage } = useLanguageActions()
  const { languages, isLoading } = useLanguages()

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const availableLanguages = useMemo(() => {
    if (videoAudioLanguageIds == null || videoAudioLanguageIds.length === 0)
      return languages

    return languages.filter((language) =>
      videoAudioLanguageIds.includes(language.id)
    )
  }, [languages, videoAudioLanguageIds])

  const selectedLanguage = useMemo(
    () => availableLanguages.find((language) => language.id === audioLanguageId),
    [availableLanguages, audioLanguageId]
  )

  const handleLanguageSelect = (languageId: string) => {
    const language = availableLanguages.find((lang) => lang.id === languageId)
    if (language == null) return

    updateAudioLanguage(
      {
        id: language.id,
        slug: language.slug
      },
      true
    )
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current != null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open && searchInputRef.current != null) {
      searchInputRef.current.focus()
    }
  }, [open])

  const displayValue = selectedLanguage?.displayName ?? t('Search languages...')

  if (isLoading) {
    return (
      <div className="relative" ref={containerRef}>
        <Button
          variant="outline"
          role="combobox"
          disabled
          className="w-full min-w-[180px] flex items-center justify-between opacity-50 h-10 px-3 bg-stone-800/50 border-stone-700/50 text-white rounded-md"
        >
          <div className="flex items-center flex-1 min-w-0">
            <Globe className="mr-2 h-4 w-4 text-stone-400 shrink-0" />
            <span className="text-white text-sm">
              {t('Loading languages...')}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-stone-400" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative min-w-[200px]" ref={containerRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between h-10 px-3 bg-stone-800/50 border-stone-700/50 hover:bg-stone-800/70 text-white rounded-md cursor-pointer"
      >
        <div className="flex items-center flex-1 min-w-0 gap-2">
          <Globe className="h-4 w-4 text-stone-400 shrink-0" />
          <span className="truncate text-sm font-medium text-white">
            {displayValue}
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-stone-400" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-[200] mt-1 px-2 bg-popover border border-border rounded-md shadow-md">
          <Command>
            <CommandInput
              ref={searchInputRef}
              placeholder={t('Search languages...')}
              className="focus:outline-none focus-visible:outline-none"
            />
            <CommandList className="max-h-[50svh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <CommandEmpty>{t('No languages found.')}</CommandEmpty>
              <CommandGroup>
                {availableLanguages.map((language) => (
                  <CommandItem
                    key={language.id}
                    value={`${language.displayName} ${language.nativeName?.value ?? ''}`}
                    onSelect={() => handleLanguageSelect(language.id)}
                    className="flex items-center justify-between cursor-pointer px-3 py-2 hover:bg-white/5"
                  >
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-sm">
                        {language.displayName}
                      </span>
                      {language.nativeName?.value != null &&
                        language.nativeName.value !== language.displayName && (
                          <span className="text-xs text-muted-foreground">
                            {language.nativeName.value}
                          </span>
                        )}
                    </div>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 text-white',
                        language.id === selectedLanguage?.id
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
