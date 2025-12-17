import { Check, ChevronsUpDown, Globe } from 'lucide-react'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import { ExtendedButton as Button } from '@core/shared/ui-modern/components'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@core/shared/ui-modern/components/command'
import { cn } from '@core/shared/ui-modern/utils'

export interface LanguageFilterOption {
  value: string
  englishName: string
  nativeName?: string
}

interface LanguageFilterDropdownProps {
  options?: LanguageFilterOption[]
  loading?: boolean
  selectedValue?: string
  placeholder?: string
  emptyLabel?: string
  loadingLabel?: string
  onSelect: (value: string) => void
  className?: string
}

export function LanguageFilterDropdown({
  options = [],
  loading = false,
  selectedValue,
  placeholder = 'Search languages...',
  emptyLabel = 'No languages found.',
  loadingLabel = 'Loading languages...',
  onSelect,
  className
}: LanguageFilterDropdownProps): ReactElement {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue]
  )

  const displayValue = selectedOption?.englishName ?? placeholder

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
    if (open && searchInputRef.current != null) {
      searchInputRef.current.focus()
    }
  }, [open])

  const handleSelect = (value: string) => {
    onSelect(value)
    setOpen(false)
  }

  if (loading) {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          role="combobox"
          disabled
          className="flex h-12 w-full items-center justify-between rounded-md border-stone-700/50 bg-stone-800/50 px-4 text-white opacity-50"
        >
          <div className="flex min-w-0 flex-1 items-center">
            <Globe className="mr-2 h-4 w-4 shrink-0 text-stone-400" />
            <span className="text-white">{loadingLabel}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-stone-400 opacity-50" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-md border-stone-700/50 bg-stone-800/50 px-4 text-white hover:bg-stone-800/70"
      >
        <div className="flex min-w-0 flex-1 items-center">
          <Globe className="mr-2 h-5 w-5 shrink-0 text-stone-400" />
          <span className="truncate text-base font-medium text-white">
            {displayValue}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 text-stone-400 opacity-50" />
      </Button>

      {open && (
        <div className="bg-popover border-border absolute left-0 right-0 top-full z-[200] mt-1 rounded-md border px-3 shadow-md">
          <Command>
            <CommandInput
              ref={searchInputRef}
              placeholder={placeholder}
              className="focus:outline-none focus-visible:outline-none"
            />
            <CommandList className="max-h-[60svh] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.englishName} ${option.nativeName ?? ''}`}
                    onSelect={() => handleSelect(option.value)}
                    className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-white/5"
                  >
                    <div className="flex flex-1 flex-col items-start">
                      <span className="text-base font-medium">
                        {option.englishName}
                      </span>
                      {option.nativeName != null &&
                        option.nativeName !== option.englishName && (
                          <span className="text-muted-foreground text-sm">
                            {option.nativeName}
                          </span>
                        )}
                    </div>
                    <Check
                      className={cn(
                        'ml-2 h-5 w-5',
                        option.value === selectedValue
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
