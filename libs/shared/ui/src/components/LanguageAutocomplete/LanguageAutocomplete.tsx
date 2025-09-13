import Autocomplete, {
  AutocompleteRenderInputParams
} from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { PopperProps } from '@mui/material/Popper'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  forwardRef,
  useMemo
} from 'react'
import { FixedSizeList as List } from 'react-window'

import { ResizeObserverPolyfill } from '../ResizeObserverPolyfill'

import { defaultRenderOption } from './defaultRenderOption'

export interface Language {
  id: string
  name: Translation[]
  slug: string | null
}

export interface Translation {
  value: string
  primary: boolean
}

export interface LanguageOption {
  id: string
  localName?: string
  nativeName?: string
  slug?: string | null
}

export interface LanguageAutocompleteProps {
  onChange: (value?: LanguageOption) => void
  value?: LanguageOption
  languages?: Language[]
  loading?: boolean
  disabled?: boolean
  helperText?: string
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode
  renderOption?: (params: HTMLAttributes<HTMLLIElement>) => ReactNode
  popper?: Omit<PopperProps, 'open'>
  error?: boolean
  disableSort?: boolean
}

export function LanguageAutocomplete({
  onChange: handleChange,
  value,
  languages,
  loading,
  disabled = false,
  renderInput,
  renderOption,
  helperText,
  popper,
  error,
  disableSort = false
}: LanguageAutocompleteProps): ReactElement {
  const options = useMemo(() => {
    if (!languages) return []

    const validOptions: LanguageOption[] = []

    for (const language of languages) {
      // Skip languages with empty or null name arrays
      if (!language.name || language.name.length === 0) {
        continue
      }

      const { id, name, slug, ...rest } = language
      const localLanguageName = name.find(({ primary }) => !primary)?.value
      const nativeLanguageName = name.find(({ primary }) => primary)?.value

      validOptions.push({
        id,
        localName: localLanguageName,
        nativeName: nativeLanguageName,
        slug,
        ...rest // Preserve additional properties like __type
      })
    }

    return validOptions
  }, [languages])

  const sortedOptions = useMemo(() => {
    if (options.length > 0 && !disableSort) {
      return options.sort((a, b) => {
        return (a.localName ?? a.nativeName ?? '').localeCompare(
          b.localName ?? b.nativeName ?? ''
        )
      })
    }
    return options
  }, [options, disableSort])

  const defaultRenderInput = (
    params: AutocompleteRenderInputParams
  ): ReactNode => (
    <TextField
      {...params}
      hiddenLabel
      placeholder="Search Language"
      variant="filled"
      helperText={helperText}
      error={error}
      InputProps={{
        ...params.InputProps,
        sx: { paddingBottom: 2 },
        endAdornment: (
          <>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        )
      }}
    />
  )

  const ListboxComponent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLElement>
  >(function ListboxComponent(props: any, ref): ReactElement {
    const { children, ...other } = props
    const theme = useTheme()
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
      noSsr: true
    })

    const itemData: Array<React.ReactElement<unknown>> = []
    ;(props?.children as Array<React.ReactElement<unknown>>).forEach(
      (
        item: React.ReactElement<unknown> & {
          children?: Array<React.ReactElement<unknown>>
        }
      ) => {
        itemData.push(item)
        itemData.push(...(item.children ?? []))
      }
    )

    const itemCount = itemData.length
    const itemSize = 45
    return (
      <Box ref={ref} {...other}>
        <ResizeObserverPolyfill />
        <List
          children={
            renderOption != null
              ? (renderOption as any)
              : (defaultRenderOption as any)
          }
          itemCount={itemCount}
          itemSize={itemSize}
          itemData={{ rows: itemData }}
          overscanCount={5}
          height={Math.min(itemCount * itemSize + 10, smUp ? 400 : 200)}
          width="100%"
          style={{
            height: Math.min(itemCount * itemSize + 10, smUp ? 400 : 200),
            width: '100%'
          }}
        />
      </Box>
    )
  })

  return (
    <>
      <ResizeObserverPolyfill />
      <Autocomplete
        disableClearable
        data-testid="LanguageAutocomplete"
        value={value}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={({ localName, nativeName }) =>
          localName ?? nativeName ?? ''
        }
        onChange={(e, option) => {
          e.stopPropagation()
          handleChange(option)
        }}
        options={sortedOptions}
        loading={loading}
        disabled={disabled}
        disablePortal={process.env.NODE_ENV === 'test'}
        renderInput={renderInput != null ? renderInput : defaultRenderInput}
        renderOption={(props, option, state) => {
          return [props, option, state.index] as React.ReactNode
        }}
        slots={{
          listbox: ListboxComponent
        }}
        slotProps={{
          popper
        }}
        sx={{
          '& .MuiInputBase-root': {
            '& .MuiInputBase-input::placeholder': {
              color: error ? 'error.main' : 'text.secondary',
              opacity: 1
            }
          }
        }}
      />
    </>
  )
}
