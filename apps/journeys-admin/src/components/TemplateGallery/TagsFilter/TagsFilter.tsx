import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import MuiPopper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
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
          <>
            {tagNames.length > 1 ? (
              <Box
                component="li"
                key={params.key}
                sx={{
                  '&:last-of-type': {
                    backgroundColor: {
                      md: hasMultipleColumns
                        ? theme.palette.grey[50]
                        : undefined
                    },
                    borderWidth: { md: '1px' },
                    borderColor: 'background.default',
                    borderRadius: 2
                  }
                }}
              >
                <Box component="ul" sx={{ p: 0 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    component="li"
                    sx={{ px: 4, py: 2 }}
                  >
                    <ParentTagIcon name={parentTagName} sx={{ width: 38 }} />
                    <Typography variant="subtitle1">{parentTagName}</Typography>
                  </Stack>
                  {params.children}
                </Box>
              </Box>
            ) : (
              params.children
            )}
          </>
        )
      }}
      renderOption={(props, option, { selected }) => (
        <Stack component="li" direction="row" spacing={2} {...props}>
          <Checkbox
            icon={
              <CheckBoxOutlineBlankIcon
                fontSize="small"
                sx={{ color: 'divider' }}
              />
            }
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            checked={selected}
            size="small"
            sx={{ p: 0 }}
          />
          <Typography
            variant="body2"
            color="secondary"
            sx={{ lineHeight: '20px' }}
          >
            {option.name.find(({ primary }) => primary)?.value ?? ''}
          </Typography>
        </Stack>
      )}
      ChipProps={{ size: 'small' }}
      slotProps={{
        popper: {
          sx: {
            '& .MuiPaper-root': { ml: 2, mt: 1 },
            '& .MuiAutocomplete-listbox': {
              py: 2,
              pb: { md: hasMultipleColumns ? 6 : undefined },
              pr: { md: hasMultipleColumns ? 6 : undefined },
              maxHeight: {
                md: 'calc(100vh - 175px)'
              },
              display: {
                xs: 'block',
                md: hasMultipleColumns ? 'flex' : undefined
              },
              '> li': {
                flexGrow: 1,
                pt: hasMultipleColumns ? 6 : undefined,
                '&:first-of-type': {
                  pt: { xs: 0, md: hasMultipleColumns ? 6 : undefined }
                }
              },
              '& .MuiAutocomplete-option': {
                px: 6,
                py: 2,
                minHeight: { xs: 40, md: 32 }
              }
            }
          }
        }
      }}
    />
  )
}
