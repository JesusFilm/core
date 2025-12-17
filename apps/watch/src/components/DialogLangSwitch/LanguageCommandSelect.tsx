import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@core/shared/ui-modern/components/command'
import { cn } from '@core/shared/ui-modern/utils'

import { Language } from '../../libs/useLanguages'

type LanguageCommandSelectProps = {
  options: Language[]
  selectedOption: Language | null
  placeholder: string
  emptyMessage: string
  loadingMessage: string
  noLanguagesMessage: string
  onSelect: (language: Language) => void
  icon?: ReactNode
  disabled?: boolean
  isLoading?: boolean
  id?: string
}

export function LanguageCommandSelect({
  options,
  selectedOption,
  placeholder,
  emptyMessage,
  loadingMessage,
  noLanguagesMessage,
  onSelect,
  icon,
  disabled = false,
  isLoading = false,
  id
}: LanguageCommandSelectProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const displayValue = useMemo(() => {
    if (isLoading) return loadingMessage
    if (disabled && !isLoading) return noLanguagesMessage
    if (selectedOption == null) return placeholder
    return selectedOption.displayName
  }, [
    isLoading,
    disabled,
    loadingMessage,
    noLanguagesMessage,
    placeholder,
    selectedOption
  ])

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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  useEffect(() => {
    if (open && searchInputRef.current != null) {
      searchInputRef.current.focus()
    }
  }, [open])

  const handleSelect = (language: Language) => {
    onSelect(language)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) setOpen((previous) => !previous)
        }}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-md border border-stone-700/50 bg-stone-800/50 px-4 text-white',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:bg-stone-800/70'
        )}
        disabled={disabled}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon}
          <span
            className={cn(
              'truncate text-base font-medium',
              isLoading ? 'loading-gradient-text' : 'text-white'
            )}
          >
            {displayValue}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 text-stone-400 opacity-50" />
      </button>

      {open && !disabled && (
        <div className="bg-popover border-border absolute left-0 right-0 top-full z-[200] mt-1 rounded-md border px-3 shadow-md">
          <Command>
            <CommandInput
              ref={searchInputRef}
              placeholder={placeholder}
              className="focus:outline-none focus-visible:outline-none"
            />
            <CommandList className="max-h-[60svh] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.displayName} ${option.nativeName?.value ?? ''} ${option.englishName?.value ?? ''}`}
                    onSelect={() => handleSelect(option)}
                    className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-white/5"
                  >
                    <div className="flex flex-1 flex-col items-start">
                      <span className="text-base font-medium">
                        {option.displayName}
                      </span>
                      {option.nativeName != null &&
                        option.nativeName.value !== option.displayName && (
                          <span className="text-muted-foreground text-sm">
                            {option.nativeName.value}
                          </span>
                        )}
                    </div>
                    <Check
                      className={cn(
                        'ml-2 h-5 w-5',
                        selectedOption?.id === option.id
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
