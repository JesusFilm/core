import Autocomplete, {
  AutocompleteRenderInputParams
} from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { PopperProps } from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useMemo
} from 'react'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'

export interface Language {
  id: string
  name: Translation[]
}

export interface Translation {
  value: string
  primary: boolean
}

export interface LanguageOption {
  id: string
  localName?: string
  nativeName?: string
}

export interface LanguageAutocompleteProps {
  onChange: (value?: LanguageOption) => void
  value?: LanguageOption
  languages?: Language[]
  loading: boolean
  helperText?: string
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode
  renderOption?: (params: HTMLAttributes<HTMLLIElement>) => ReactNode
  popper?: Omit<PopperProps, 'open'>
}

const OuterElementContext = createContext({})

const OuterElementType = forwardRef<HTMLDivElement>(
  function OuterElementType(props, ref): ReactElement {
    const outerProps = useContext(OuterElementContext)
    return <div ref={ref} {...props} {...outerProps} />
  }
)

const defaultRenderOption = (props: ListChildComponentProps): ReactNode => {
  const { data, index, style } = props
  const { id, localName, nativeName } = data[index][1]
  const { key, ...optionProps } = data[index][0]

  return (
    <Box {...optionProps} key={id} style={style} tabIndex={1}>
      <Stack>
        <Typography>{localName ?? nativeName}</Typography>
        {localName != null && nativeName != null && (
          <Typography variant="body2" color="text.secondary">
            {nativeName}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

export function LanguageAutocomplete({
  onChange: handleChange,
  value,
  languages,
  loading,
  renderInput,
  renderOption,
  helperText,
  popper
}: LanguageAutocompleteProps): ReactElement {
  const options = useMemo(() => {
    return (
      languages?.map(({ id, name }) => {
        const localLanguageName = name.find(({ primary }) => !primary)?.value
        const nativeLanguageName = name.find(({ primary }) => primary)?.value

        return {
          id,
          localName: localLanguageName,
          nativeName: nativeLanguageName
        }
      }) ?? []
    )
  }, [languages])

  const sortedOptions = useMemo(() => {
    if (options.length > 0) {
      return options.sort((a, b) => {
        return (a.localName ?? a.nativeName ?? '').localeCompare(
          b.localName ?? b.nativeName ?? ''
        )
      })
    }
    return []
  }, [options])

  const defaultRenderInput = (
    params: AutocompleteRenderInputParams
  ): ReactNode => (
    <TextField
      {...params}
      hiddenLabel
      placeholder="Search Language"
      variant="filled"
      helperText={helperText}
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
    const itemSize = 44
    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <List
            itemData={itemData}
            outerElementType={OuterElementType}
            height={smUp ? 400 : 200}
            width="100%"
            innerElementType="ul"
            itemSize={itemSize}
            overscanCount={20}
            itemCount={itemCount}
          >
            {renderOption != null ? renderOption : defaultRenderOption}
          </List>
        </OuterElementContext.Provider>
      </div>
    )
  })

  return (
    <Autocomplete
      disableListWrap
      disableClearable
      value={value}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={({ localName, nativeName }) =>
        localName ?? nativeName ?? ''
      }
      onChange={(_event, option) => {
        handleChange(option)
      }}
      options={sortedOptions}
      loading={loading}
      disablePortal={process.env.NODE_ENV === 'test'}
      renderInput={renderInput != null ? renderInput : defaultRenderInput}
      renderOption={(props, option, state) => {
        console.log(props)
        return [props, option, state.index] as React.ReactNode
      }}
      slots={{
        listbox: ListboxComponent
      }}
      slotProps={{
        popper
      }}
    />
  )
}
