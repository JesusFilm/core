import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { ReactElement } from 'react'

import { GetTags_tags as Tag } from '../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../libs/useTagsQuery'
import { ParentTagIcon } from '../../ParentTagIcon'

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
  const { parentTags, childTags, loading } = useTagsQuery()
  const theme = useTheme()
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
        loading={loading}
        disableCloseOnSelect
        value={filteredSelectedTags}
        onChange={handleChange}
        options={filteredChildTags}
        groupBy={(option) => option.parentId ?? ''}
        getOptionLabel={(option) =>
          option.name.find(({ primary }) => primary)?.value ?? ''
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        renderGroup={(params) => {
          const parentTagName = parentTags
            .find(({ id }) => id === params.group)
            ?.name.find(({ primary }) => primary)?.value
          return (
            <li
              key={params.key}
              style={{
                paddingLeft: parentTagName === 'Topics' ? 0 : 12,
                paddingRight: 12,
                marginLeft: parentTagName === 'Collections' ? 16 : 0,
                borderRadius: 8,
                backgroundColor:
                  parentTagName === 'Collections'
                    ? theme.palette.grey[100]
                    : 'background.paper',

                border:
                  parentTagName === 'Collections' ? '1px solid #EFEFEF' : 'none'
              }}
            >
              {tagNames.length > 1 && (
                <Stack direction="row" alignItems="center" gap={3}>
                  <ParentTagIcon name={parentTagName} sx={{ ml: 2 }} />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      flex: 'none',
                      top: 0,
                      py: 2
                    }}
                  >
                    {parentTagName}
                  </Typography>
                </Stack>
              )}
              <Box>{params.children}</Box>
            </li>
          )
        }}
        renderOption={(props, option, { selected }) => (
          <li
            {...props}
            style={{ padding: 0, paddingTop: 6, paddingBottom: 6 }}
          >
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              sx={{ mr: 2 }}
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
              zIndex: 1,
              '& .MuiAutocomplete-listbox': {
                maxHeight: { xs: 'auto', sm: '100%' },
                display: { xs: 'block', sm: 'flex' },
                '> li': {
                  flexGrow: 1
                }
              }
            }
          },
          paper: {
            sx: {
              p: { xs: 0, sm: 4 }
            }
          }
        }}
      />
    </Box>
  )
}
