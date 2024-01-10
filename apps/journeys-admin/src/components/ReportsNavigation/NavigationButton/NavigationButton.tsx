import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { ReactElement } from 'react'

interface NavigationButtonProps {
  selected: boolean
  value: string
  link: string
}

export function NavigationButton({
  selected,
  value,
  link
}: NavigationButtonProps): ReactElement {
  return (
    <NextLink href={link} passHref legacyBehavior prefetch={false}>
      <Button
        aria-selected={selected}
        variant={selected ? 'contained' : 'outlined'}
        sx={{
          p: 4,
          minWidth: { xs: '120px', md: '250px' },
          borderRadius: 1,
          backgroundColor: selected ? undefined : 'background.paper'
        }}
        data-testid="NavigationButton"
      >
        <Typography variant="subtitle1">{value}</Typography>
      </Button>
    </NextLink>
  )
}
