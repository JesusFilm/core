import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Checkbox from '@mui/material/Checkbox'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useRefinementList } from 'react-instantsearch'

export function TagsRefinementList(props): ReactElement {
  const {
    items,
    refine,
    searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore
  } = useRefinementList(props)

  return (
    <>
      <ul>
        {items.map((item) => (
          <Stack
            component="li"
            direction="row"
            spacing={2}
            {...props}
            key={item.value}
          >
            <Checkbox
              icon={
                <CheckBoxOutlineBlankIcon
                  fontSize="small"
                  sx={{ color: 'divider' }}
                />
              }
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              checked={item.isRefined}
              onChange={() => refine(item.value)}
              size="small"
              sx={{ p: 0 }}
            />
            <Typography
              variant="body2"
              color="secondary"
              sx={{ lineHeight: '20px' }}
            >
              {item.label}
            </Typography>
          </Stack>
        ))}
      </ul>
    </>
  )
}
