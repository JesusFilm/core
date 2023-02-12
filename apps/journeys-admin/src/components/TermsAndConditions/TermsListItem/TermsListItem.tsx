import NextLink from 'next/link'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { ReactElement } from 'react'

export interface TermsListItemProps {
  link: string
  icon: ReactElement
  text: string
}

export function TermsListItem({
  link,
  icon,
  text
}: TermsListItemProps): ReactElement {
  return (
    <ListItem disablePadding>
      <NextLink href={link} passHref>
        <Button
          startIcon={icon}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            borderRadius: 0
          }}
        >
          <Typography variant="body1" sx={{ ml: 4.5, pt: 3, pb: 3 }}>
            {text}
          </Typography>
        </Button>
      </NextLink>
    </ListItem>
  )
}
