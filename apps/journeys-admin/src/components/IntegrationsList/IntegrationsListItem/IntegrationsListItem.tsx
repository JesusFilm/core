import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'

import { ReactElement } from 'react'

interface IntegrationItemProps {
  imageSrc?: string
  title?: string
  url: string
}

export function IntegrationsListItem({
  imageSrc,
  title,
  url
}: IntegrationItemProps): ReactElement {
  return (
    <Card
      style={{
        width: 150,
        height: 180,
        margin: 'auto',
        border: 'none',
        borderRadius: 2,
        boxShadow: 'none'
      }}
    >
      {/* <NextLink href={url} passHref legacyBehavior> */}
      <CardMedia style={{ height: 200 }} image={imageSrc} title={title} />
      <Typography variant="h6">{title}</Typography>
      {/* </NextLink> */}
    </Card>
  )
}
