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

  const order = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'caption',
    'overline'
  ]
  const sorted = Object.values(TypographyVariant).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

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
        {sorted.map((variant) => {
          return (
            <ListItemButton
              key={`${id}-text-${variant}`}
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
