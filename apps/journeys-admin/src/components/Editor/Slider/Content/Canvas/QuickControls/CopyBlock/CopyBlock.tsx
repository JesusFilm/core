import IconButton from '@mui/material/IconButton'
import { enqueueSnackbar } from 'notistack'
import { ReactElement } from 'react'

import CopyToIcon from '@core/shared/ui/icons/CopyTo'

export function CopyBlock(): ReactElement {
  function handleClick(): void {
    // TODO: functionality to copy the block

    enqueueSnackbar('Block Copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <>
      <IconButton onClickCapture={handleClick}>
        <CopyToIcon />
      </IconButton>
    </>
  )
}
