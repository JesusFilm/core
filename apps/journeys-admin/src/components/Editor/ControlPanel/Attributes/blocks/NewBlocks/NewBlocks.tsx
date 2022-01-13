import { ReactElement } from 'react'
import TextFieldsRounded from '@mui/icons-material/TextFieldsRounded'
import InsertPhotoRounded from '@mui/icons-material/InsertPhotoRounded'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import DraftsRounded from '@mui/icons-material/DraftsRounded'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button } from '../../../Button'

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
        <Button
          icon={<TextFieldsRounded />}
          name=""
          value="Text"
          description=""
        />
        <Button
          icon={<InsertPhotoRounded />}
          name=""
          value="Image"
          description=""
        />
        <Button
          icon={<VideocamRounded />}
          name=""
          value="Video"
          description=""
        />
        <Button
          icon={<ContactSupportRounded />}
          name=""
          value="Poll"
          description=""
        />
        <Button
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
