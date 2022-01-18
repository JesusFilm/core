import { ReactElement, useState } from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import capitalize from 'lodash/capitalize'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded'
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded'
import { TypographyAlign } from '../../../../../../../../__generated__/globalTypes'

interface TextAlignProps {
  id: string
  align: TypographyAlign | null
}

export function TextAlign({ id, align }: TextAlignProps): ReactElement {
  const [selected, setSelected] = useState(align ?? 'left')

  function handleClick(align: TypographyAlign): void {
    setSelected(align)
  }

  function iconSelector(align: TypographyAlign): ReactElement {
    switch (align) {
      case 'left':
        return <FormatAlignLeftRoundedIcon />
      case 'center':
        return <FormatAlignCenterRoundedIcon />
      case 'right':
        return <FormatAlignRightRoundedIcon />
      default:
        return <></>
    }
  }

  return (
    <>
      <List
        sx={{
          '&& .Mui-selected, && .Mui-selected:hover': {
            bgcolor: 'background.default',
            '&, & .MuiListItemIcon-root': {
              color: 'primary.main'
            }
          }
        }}
      >
        {Object.values(TypographyAlign).map((align) => {
          return (
            <ListItemButton
              key={`${id}-align-${align}`}
              onClick={() => handleClick(align)}
              selected={align === selected}
              sx={{
                borderRadius: 0,
                border: '1px solid',
                borderColor: 'divider',
                borderBottom: 'none',
                bgcolor: 'background.paper',
                '&:first-of-type': {
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12
                },
                '&:last-of-type': {
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }
              }}
            >
              <ListItemIcon>{iconSelector(align)}</ListItemIcon>
              <ListItemText>{capitalize(align)}</ListItemText>
            </ListItemButton>
          )
        })}
      </List>
    </>
  )
}
