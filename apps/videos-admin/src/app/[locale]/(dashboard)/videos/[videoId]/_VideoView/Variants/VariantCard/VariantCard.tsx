import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'

export interface VariantCardProps {
  variant: GetAdminVideoVariant
  imageURL?: string
  onClick?: () => void
}

export function VariantCard({
  variant,
  imageURL,
  onClick
}: VariantCardProps): ReactElement {
  return (
    <Card key={variant.id} sx={{ p: 0 }} onClick={(_e) => onClick?.()}>
      <CardActionArea sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h6">{variant.language.name[0].value}</Typography>
          <Typography variant="body1">{variant.slug}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
