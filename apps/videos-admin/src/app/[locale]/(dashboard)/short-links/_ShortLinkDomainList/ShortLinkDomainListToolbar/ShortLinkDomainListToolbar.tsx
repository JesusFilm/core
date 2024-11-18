import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton
} from '@mui/x-data-grid'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import React, { ReactElement, useState } from 'react'

const DynamicShortLinkDomainNewDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ShortLinkDomainNewDialog" */ '../../_ShortLinkDomainNewDialog'
    ).then((mod) => mod.ShortLinkDomainNewDialog)
)

export function ShortLinkDomainListToolbar(): ReactElement {
  const t = useTranslations()
  const [open, setOpen] = useState<boolean | null>(null)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Box flexGrow={1} />
      <Button variant="contained" color="primary" onClick={handleOpen}>
        {t('Add Short Link Domain')}
      </Button>
      {open != null && (
        <DynamicShortLinkDomainNewDialog open={open} onClose={handleClose} />
      )}
    </GridToolbarContainer>
  )
}
