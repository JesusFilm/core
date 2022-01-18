import { ReactElement, useState } from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import Typography from '@mui/material/Typography'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'

interface FontVariantProps {
  id: string
  variant: TypographyVariant | null
}

export function FontVariant({ id, variant }: FontVariantProps): ReactElement {
  const [selected, setSelected] = useState(variant ?? 'body2')

  function handleClick(variant: TypographyVariant): void {
    setSelected(variant)
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
        {Object.values(TypographyVariant).map((variant) => {
          return (
            <ListItemButton
              key={`${id}-color-${variant}`}
              onClick={() => handleClick(variant)}
              selected={variant === selected}
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
              <ListItemIcon></ListItemIcon>
              <ListItemText>
                <Typography variant={variant}>
                  {capitalize(
                    lowerCase(variant?.toString() ?? 'body2').replace(
                      'h',
                      'header'
                    )
                  )}
                </Typography>
              </ListItemText>
            </ListItemButton>
          )
        })}
      </List>
    </>
  )
}
