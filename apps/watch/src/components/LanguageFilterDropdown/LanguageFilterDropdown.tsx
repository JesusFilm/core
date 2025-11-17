import { Check, ChevronsUpDown, Globe } from 'lucide-react'
import {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

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
          className="w-full flex items-center justify-between opacity-50 h-12 px-4 bg-stone-800/50 border-stone-700/50 text-white rounded-md"
        >
          <div className="flex items-center flex-1 min-w-0">
            <Globe className="mr-2 h-4 w-4 text-stone-400 shrink-0" />
            <span className="text-white">{loadingLabel}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-stone-400" />
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
              placeholder={placeholder}
              className="focus:outline-none focus-visible:outline-none"
            />
            <CommandList className="max-h-[60svh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.englishName} ${option.nativeName ?? ''}`}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center justify-between cursor-pointer px-4 py-2 hover:bg-white/5"
                  >
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-base">
                        {option.englishName}
                      </span>
                      {option.nativeName != null &&
                        option.nativeName !== option.englishName && (
                          <span className="text-sm text-muted-foreground">
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
