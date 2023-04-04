import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import NextLink from 'next/link'
import { ReactElement } from 'react'

interface Props {
  selected: boolean
  value: string
  link: string
}

export function NavigationButton({
  selected,
  value,
  link
}: Props): ReactElement {
  return (
    <NextLink href={link} passHref>
      <Button
        aria-selected={selected}
        variant={selected ? 'contained' : 'outlined'}
        sx={{
          p: 4,
          minWidth: { xs: '120px', md: '250px' },
          borderRadius: 1,
          backgroundColor: selected ? undefined : 'background.paper'
        }}
      >
        <Typography variant="subtitle1">{value}</Typography>
      </Button>
    </NextLink>
  )
}
