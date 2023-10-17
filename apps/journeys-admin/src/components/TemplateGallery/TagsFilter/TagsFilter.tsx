import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { ReactElement } from 'react'

import { GetTags_tags as Tag } from '../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../libs/useTagsQuery'

interface TagsFilterProps {
  label: string
  tagNames: string[]
  selectedTagIds: string[]
  onChange: (selectedTagIds: string[], filteredTagIds: string[]) => void
}

export function TagsFilter({
  label,
  tagNames,
  selectedTagIds,
  onChange
}: TagsFilterProps): ReactElement {
  const { parentTags, childTags } = useTagsQuery()
  const filteredParentTagIds = compact(
    tagNames.map((tagName) => {
      return parentTags.find(({ name }) =>
        name.some(({ value }) => value === tagName)
      )?.id
    })
  )
  const filteredChildTags = childTags
    .filter(({ parentId }) =>
      filteredParentTagIds.some((tagId) => tagId === parentId)
    )
    .sort((a, b) => {
      if (a.parentId === b.parentId) return 0
      if (
        filteredParentTagIds.indexOf(a.parentId) <
        filteredParentTagIds.indexOf(b.parentId)
      )
        return -1
      return 1
    })
  const filteredChildTagIds = filteredChildTags.map(({ id }) => id)

  const filteredSelectedTags = compact(
    selectedTagIds.map((tagId) =>
      filteredChildTags.find(({ id }) => id === tagId)
    )
  )

  function handleChange(_event, value: Tag[]): void {
    onChange(
      value.map(({ id }) => id),
      filteredChildTagIds
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        value={filteredSelectedTags}
        onChange={handleChange}
        options={filteredChildTags}
        groupBy={(option) => option.parentId ?? ''}
        getOptionLabel={(option) =>
          option.name.find(({ primary }) => primary)?.value ?? ''
        }
        renderInput={(params) => <TextField {...params} label={label} />}
        renderGroup={(params) => (
          <li key={params.key}>
            {tagNames.length > 1 && (
              <Typography
                variant="subtitle1"
                sx={{
                  position: 'sticky',
                  top: 0,
                  py: 2,
                  px: 5,
                  backgroundColor: 'background.paper',
                  zIndex: 99999
                }}
              >
                {
                  parentTags
                    .find(({ id }) => id === params.group)
                    ?.name.find(({ primary }) => primary)?.value
                }
              </Typography>
            )}
            <Box>{params.children}</Box>
          </li>
        )}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.name.find(({ primary }) => primary)?.value ?? ''}
          </li>
        )}
        multiple
        fullWidth
        slotProps={{
          popper: {
            sx: {
              '& .MuiAutocomplete-listbox': {
                display: 'flex',
                '> li': {
                  flexGrow: 1
                }
              }
            }
          }
        }}
      />
    </Box>
  )
}
