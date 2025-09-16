import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { SyntheticEvent, useMemo, useState } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { languageRefinementProps } from '@core/journeys/ui/algolia/SearchBarProvider'

export function LanguageFilter(): JSX.Element {
  const { t } = useTranslation('apps-watch')
  const { items, refine } = useRefinementList(languageRefinementProps)

  const [inputValue, setInputValue] = useState('')

  const selectedItems = useMemo(
    () => items.filter((item) => item.isRefined),
    [items]
  )

  function toggleSelections(values: RefinementListItem[]): void {
    const selected = new Set(values.map((item) => item.value))
    items.forEach((item) => {
      const shouldSelect = selected.has(item.value)
      if (item.isRefined !== shouldSelect) {
        refine(item.value)
      }
    })
  }

  return (
    <Autocomplete
      multiple
      disablePortal
      disableCloseOnSelect
      options={items}
      value={selectedItems}
      onChange={(_, values) => {
        toggleSelections(values)
      }}
      inputValue={inputValue}
      onInputChange={(
        _event: SyntheticEvent,
        value: string
      ) => {
        setInputValue(value)
      }}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      filterSelectedOptions
      size="small"
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            label={option.label}
            size="small"
            color="secondary"
            key={option.value}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('Filter by language')}
          placeholder={t('Search languages')}
        />
      )}
      noOptionsText={
        inputValue.length > 0
          ? t('No languages found')
          : t('No languages available')
      }
    />
  )
}
