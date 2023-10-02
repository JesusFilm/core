import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { ReactElement } from 'react'

interface ElementsWrapperProps {
  children: ReactElement
}

// Wraps around the all of the field elements

export function ElementsWrapper({
  children
}: ElementsWrapperProps): ReactElement {
  return (
    <Card
      data-testid="ElementsWrapper"
      sx={{
        width: '404px',
        borderRadius: '8px',
        mb: '18px'
      }}
    >
      <CardContent
        sx={{
          '&:last-of-type': {
            paddingBottom: '28px'
          },
          pt: '12px',
          px: '24px'
        }}
      >
        {children}
      </CardContent>
    </Card>
  )
}
