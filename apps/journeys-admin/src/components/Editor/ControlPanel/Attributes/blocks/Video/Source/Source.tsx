import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import { VideoLibraryDrawer } from '../../../../../VideoLibraryDrawer'

export function Source(): ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="contained"
        startIcon={<SubscriptionsRounded />}
        size="medium"
        onClick={() => setOpen(true)}
      >
        Video Library
      </Button>
      <VideoLibraryDrawer openDrawer={open} />
    </>
  )
}
