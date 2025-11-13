import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@core/shared/uimodern/components/command'
import { cn } from '@core/shared/uimodern/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { Language } from '../../libs/useLanguages'

type LanguageCommandSelectProps = {
  options: Language[]
  selectedOption: Language | null
  placeholder: string
  emptyMessage: string
  loadingMessage: string
  helperText?: string
  onSelect: (language: Language) => void
  icon?: ReactNode
  disabled?: boolean
  id?: string
  ariaDescribedBy?: string
}

export function LanguageCommandSelect({
  options,
  selectedOption,
  placeholder,
  emptyMessage,
  loadingMessage,
  helperText,
  onSelect,
  icon,
  disabled = false,
  id,
  ariaDescribedBy
}: LanguageCommandSelectProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const displayValue = useMemo(() => {
    if (disabled) return loadingMessage
    if (selectedOption == null) return placeholder
    return selectedOption.displayName
  }, [disabled, placeholder, loadingMessage, selectedOption])

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
        aria-describedby={ariaDescribedBy}
        onClick={() => {
          if (!disabled) setOpen((previous) => !previous)
        }}
        className="w-full flex items-center justify-between cursor-pointer h-12 px-4 bg-stone-800/50 border border-stone-700/50 hover:bg-stone-800/70 text-white rounded-md"
        disabled={disabled}
      >
        <div className="flex items-center flex-1 min-w-0 gap-2">
          {icon}
          <span className="truncate text-base font-medium text-white">
            {displayValue}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50 text-stone-400" />
      </button>

      {open && !disabled && (
        <div className="absolute top-full left-0 right-0 z-[200] mt-1 px-3 bg-popover border border-border rounded-md shadow-md">
          <Command>
            <CommandInput
              ref={searchInputRef}
              placeholder={placeholder}
              className="focus:outline-none focus-visible:outline-none"
            />
            <CommandList className="max-h-[60svh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={`${option.displayName} ${option.nativeName?.value ?? ''} ${option.englishName?.value ?? ''}`}
                    onSelect={() => handleSelect(option)}
                    className="flex items-center justify-between cursor-pointer px-4 py-2 hover:bg-white/5"
                  >
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-base">
                        {option.displayName}
                      </span>
                      {option.nativeName != null &&
                        option.nativeName.value !== option.displayName && (
                          <span className="text-sm text-muted-foreground">
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
      {helperText != null && (
        <p
          id={ariaDescribedBy}
          className="mt-2 text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
