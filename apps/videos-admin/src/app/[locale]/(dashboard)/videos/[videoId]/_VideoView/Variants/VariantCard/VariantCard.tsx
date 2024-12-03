import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import dynamic from 'next/dynamic'
import { CSSProperties, ReactElement, useState } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'

const VariantDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VariantDialog" */
      './VariantDialog'
    ).then((mod) => mod.VariantDialog),
  { ssr: false }
)

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
      <ListItem style={style} component="div">
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
