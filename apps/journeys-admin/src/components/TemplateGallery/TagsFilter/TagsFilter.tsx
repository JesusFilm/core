import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { ReactElement, useState } from 'react'

import { GetTags_tags as Tag } from '../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../libs/useTagsQuery'

interface TagsFilterProps {
  label: string
  tagNames: string[]
  onChange: (value: Tag[]) => void
}

export function TagsFilter({
  label,
  tagNames,
  onChange
}: TagsFilterProps): ReactElement {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const { parentTags, childTags } = useTagsQuery()
  const filteredParentTags = compact(
    tagNames.map((tagName) => {
      return parentTags.find(({ name }) =>
        name.some(({ value }) => value === tagName)
      )
    })
  )
  const filteredParentTagIds = filteredParentTags.map(({ id }) => id)
  const filteredChildTags = childTags
    .filter(({ parentId }) =>
      filteredParentTags.some(({ id }) => id === parentId)
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

  function handleChange(_event, value: Tag[]): void {
    setSelectedTags(value)
    onChange?.(value)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        value={selectedTags}
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
