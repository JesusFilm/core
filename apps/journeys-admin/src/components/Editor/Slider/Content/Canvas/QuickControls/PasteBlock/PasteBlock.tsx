import IconButton from '@mui/material/IconButton'
import { enqueueSnackbar } from 'notistack'
import { ReactElement } from 'react'

import FolderDown1Icon from '@core/shared/ui/icons/FolderDown1'

export function PasteBlock(): ReactElement {
  function handleClick(): void {
    // paste block functionality

    enqueueSnackbar('Block pasted', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <>
      <IconButton onClickCapture={handleClick}>
        <FolderDown1Icon />
      </IconButton>
    </>
  )
}
