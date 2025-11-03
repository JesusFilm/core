import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ComponentProps, MouseEvent, ReactElement, ReactNode } from 'react'

interface ItemProps {
  variant: 'icon-button' | 'button' | 'menu-item'
  icon: ReactNode
  label: string
  href?: string
  ButtonProps?: ComponentProps<typeof Button>
  onClick?: (event: MouseEvent<HTMLElement>) => void
  count?: number
  countLabel?: string
}

export function Item({
  variant,
  icon,
  label,
  href,
  ButtonProps,
  onClick,
  count,
  countLabel
}: ItemProps): ReactElement {
  switch (variant) {
    case 'icon-button': {
      const { sx: buttonPropsSx, ...restButtonProps } = ButtonProps ?? {}

      return (
        <Tooltip
          title={label}
          arrow
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 0.5]
                }
              }
            ]
          }}
        >
          <span>
            {count != null ? (
              <Button
                startIcon={icon}
                component={href != null ? 'a' : 'button'}
                target={href != null ? '_blank' : undefined}
                href={href}
                onClick={onClick}
                aria-label={label}
                color="secondary"
                sx={{
                  fontWeight: 'normal',
                  color: 'text.secondary',
                  '& > .MuiButton-startIcon > .MuiSvgIcon-root': {
                    fontSize: '24px'
                  },
                  ...buttonPropsSx
                }}
                {...restButtonProps}
              >
                {count.toLocaleString()}
              </Button>
            ) : (
              <IconButton
                component={href != null ? 'a' : 'button'}
                target={href != null ? '_blank' : undefined}
                href={href}
                onClick={onClick}
                aria-label={label}
                {...ButtonProps}
              >
                {icon}
              </IconButton>
            )}
          </span>
        </Tooltip>
      )
    }
    case 'button':
      return (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={icon}
          component={href != null ? 'a' : 'button'}
          target={href != null ? '_blank' : undefined}
          href={href}
          onClick={onClick}
          {...ButtonProps}
        >
          <Typography variant="subtitle2" sx={{ py: 1 }}>
            {label}
          </Typography>
        </Button>
      )
    case 'menu-item':
      return (
        <MenuItem
          component={href != null ? 'a' : 'li'}
          target={href != null ? '_blank' : undefined}
          href={href}
          onClick={onClick}
        >
          <ListItemIcon
            sx={{
              color: 'secondary.main'
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText secondary={countLabel ?? count?.toLocaleString()}>
            {label}
          </ListItemText>
        </MenuItem>
      )
  }
}
