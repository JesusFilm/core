import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { CSSProperties, ReactElement, useState } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { VariantDialog } from '../VariantDialog'

export interface VariantCardProps {
  variant: GetAdminVideoVariant
  style?: CSSProperties
}

export function VariantCard({
  variant,
  style
}: VariantCardProps): ReactElement {
  const [open, setOpen] = useState<boolean | null>(null)

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  return (
    <>
      <Card
        key={variant.id}
        sx={{
          p: 0,
          '&.MuiCard-root': { height: '80px', position: 'static', ...style }
        }}
        onClick={handleOpen}
      >
        <CardActionArea sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6">
              {variant.language.name[0].value}
            </Typography>
            <Typography variant="body1">{variant.slug}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      {open != null && (
        <VariantDialog open={open} onClose={handleClose} variant={variant} />
      )}
    </>
  )
}
