import { ReactElement, useState } from 'react'
import { Button } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'

export function Add(): ReactElement {
  const [active, setActive] = useState<boolean>(false)
  // realised that this might have its own handle actions so created its as a subcomponent

  // clicking on Add Button should change to active tab blocks

  // changing to blocks tab should hide button
  // changing away from Blocks tab should show button
  // in Canvas set active state to to be true if blocks tab is active

  return active ? (
    <></>
  ) : (
    <Button
      variant="contained"
      size="small"
      startIcon={<AddRounded />}
      sx={{
        position: 'absolute',
        zIndex: 'modal',
        width: 105,
        height: 48,
        boxShadow: 5,
        right: 20,
        bottom: 260
      }}
    >
      ADD
    </Button>
  )
}
