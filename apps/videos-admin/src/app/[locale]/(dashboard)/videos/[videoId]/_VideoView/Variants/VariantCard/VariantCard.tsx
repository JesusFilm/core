import ListItem from '@mui/material/ListItem'
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
      <ListItem
        onClick={handleOpen}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
          borderRadius: 1,
          p: 1,
          '&:hover': {
            cursor: 'pointer',
            backgroundColor: 'action.hover'
          },
          transition: 'background-color 0.3s ease',
          ...style,
          // css below the spread styles will override react-window styles, use with caution
          height: 66,
          width: 'calc(100% - 20px)'
        }}
      >
        <ListItemText
          primary={variant.language.name[0].value}
          secondary={variant.language.id}
        />
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
