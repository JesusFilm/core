import { Box, Button, TextField, Typography } from '@mui/material'
import { ReactElement } from 'react'

import { noop } from 'lodash'
import { ImageUpload } from '../../../../../../apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload'

export function JourneysQuickPage(): ReactElement {
  function onSave(): void {
    console.log('Saving form')
    // populate the submitted fields into the journey
    // redirect to shareable link page
  }

  return (
    <Box>
      <Typography> Journeys Form Page</Typography>
      <Typography> Name: </Typography>
      <TextField />
      <Typography> Email: </Typography>
      <TextField />

      {/* Use imageblock on journey?  */}
      <Typography>Image: </Typography>

      <ImageUpload selectedBlock={null} onChange={noop} />
      <Typography> Social media link: </Typography>
      <TextField />
      <Button onClick={onSave}> Save Button</Button>
    </Box>
  )
}
