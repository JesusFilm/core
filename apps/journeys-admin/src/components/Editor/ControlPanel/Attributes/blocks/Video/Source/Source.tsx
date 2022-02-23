import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import { VideoLibraryDrawer } from '../../../../../VideoLibraryDrawer'

export function Source(): ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="text"
        startIcon={<SubscriptionsRounded />}
        size="small"
        onClick={() => setOpen(true)}
        sx={{
          mx: 'auto'
        }}
      >
        Select a Video
      </Button>
      <VideoLibraryDrawer
        openDrawer={open}
        closeDrawer={() => setOpen(false)}
      />
    </>
  )
}
