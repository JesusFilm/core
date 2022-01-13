import { ReactElement } from 'react'
import TextFieldsRounded from '@mui/icons-material/TextFieldsRounded'
import InsertPhotoRounded from '@mui/icons-material/InsertPhotoRounded'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import DraftsRounded from '@mui/icons-material/DraftsRounded'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Attribute } from '../..'

export function NewBlocks(): ReactElement {
  return (
    <>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <Attribute
          id="Text-Block"
          icon={<TextFieldsRounded />}
          name=""
          value="Text"
          description=""
        />
        <Attribute
          id="Image-Block"
          icon={<InsertPhotoRounded />}
          name=""
          value="Image"
          description=""
        />
        <Attribute
          id="Video-Block"
          icon={<VideocamRounded />}
          name=""
          value="Video"
          description=""
        />
        <Attribute
          id="Poll-Block"
          icon={<ContactSupportRounded />}
          name=""
          value="Poll"
          description=""
        />
        <Attribute
          id="Subscribe-Block"
          icon={<DraftsRounded />}
          name=""
          value="Subscribe"
          description=""
        />
      </Stack>
      <Box
        sx={{
          py: 4.25,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography align="center">Select a Block to Insert</Typography>
      </Box>
    </>
  )
}
