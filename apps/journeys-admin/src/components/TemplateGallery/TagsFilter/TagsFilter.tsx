import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import MuiPopper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { ReactElement, useCallback } from 'react'

import { GetTags_tags as Tag } from '../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../libs/useTagsQuery'
import { ParentTagIcon } from '../../ParentTagIcon'

interface TagsFilterProps {
  label: string
  tagNames: string[]
  selectedTagIds: string[]
  onChange: (selectedTagIds: string[], filteredTagIds: string[]) => void
  popperElementId?: string
}

const StyledLi = styled('li')({})

export function TagsFilter({
  label,
  tagNames,
  selectedTagIds,
  onChange,
  popperElementId
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

  const Popper = useCallback(
    (props) => {
      const anchorEl = document.getElementById(popperElementId as string)

      return (
        <MuiPopper
          {...props}
          anchorEl={anchorEl}
          style={{ width: anchorEl?.clientWidth }}
          placement="bottom"
        />
      )
    },
    [popperElementId]
  )

  const hasMultipleColumns = tagNames.length > 1
  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        PopperComponent={popperElementId != null ? Popper : undefined}
        loading={loading}
        limitTags={hasMultipleColumns ? 4 : 1}
        disableCloseOnSelect
        multiple
        fullWidth
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
              sx: {
                minWidth: 0,
                '.MuiInputBase-input.MuiOutlinedInput-input': {
                  minWidth: 0
                }
              },
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
            <StyledLi
              key={params.key}
              sx={{
                '&:last-of-type': {
                  pl: { xs: 0, md: hasMultipleColumns ? 6 : 0 },
                  backgroundColor: {
                    xs: 'background.paper',
                    md: hasMultipleColumns
                      ? theme.palette.grey[100]
                      : 'background.paper'
                  },
                  borderWidth: '1px',
                  borderColor: {
                    xs: 'background.paper',
                    md: hasMultipleColumns
                      ? 'background.default'
                      : 'background.paper'
                  }
                },
                pt: hasMultipleColumns ? 6 : 0,
                pl: hasMultipleColumns ? 0 : 6,
                pr: hasMultipleColumns ? 6 : 0,
                borderRadius: 2
              }}
            >
              {tagNames.length > 1 && (
                <Stack direction="row" alignItems="center" gap={1}>
                  <ParentTagIcon name={parentTagName} sx={{ ml: 1 }} />
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
            </StyledLi>
          )
        }}
        renderOption={(props, option, { selected }) => (
          <StyledLi
            {...props}
            sx={{
              '&.MuiAutocomplete-option': {
                p: 0,
                pt: '6px',
                pb: '6px'
              }
            }}
          >
            <Checkbox
              icon={
                <CheckBoxOutlineBlankIcon
                  fontSize="small"
                  sx={{ color: 'divider' }}
                />
              }
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              sx={{ mr: 2, ml: 1, p: 0 }}
              checked={selected}
            />
            <Typography
              variant="body2"
              sx={{
                pr: 1,
                color: 'secondary.main'
              }}
            >
              {option.name.find(({ primary }) => primary)?.value ?? ''}
            </Typography>
          </StyledLi>
        )}
        ChipProps={{
          size: 'small'
        }}
        slotProps={{
          popper: {
            sx: {
              '& .MuiAutocomplete-listbox': {
                pt: 3,
                maxHeight: { xs: 'auto', sm: '100%' },
                display: { xs: 'block', md: 'flex' },
                '> li': {
                  flexGrow: 1
                }
              }
            }
          },
          paper: {
            sx: {
              px: { xs: 0, sm: hasMultipleColumns ? 6 : 4 },
              pl: { xs: 4 }
            }
          }
        }}
      />
    </Box>
  )
}
