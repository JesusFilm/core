import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { CSSProperties, ReactElement, useState } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'

import { VariantDialog } from './VariantDialog'

export interface VariantCardProps {
  key: number
  variant: GetAdminVideoVariant
  style?: CSSProperties
}

export function VariantCard({
  key,
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
      <ListItem style={style} key={key} component="div">
        <ListItemButton onClick={handleOpen} sx={{ height: '100%' }}>
          <ListItemText
            primary={variant.language.name[0].value}
            secondary={variant.language.id}
          />
        </ListItemButton>
      </ListItem>
      {open != null && (
        <VariantDialog
          open={open}
          handleClose={handleClose}
          variant={variant}
        />
      )}
    </>
  )
}
