import { DropzoneArea } from 'mui-file-dropzone'
import Button from '@mui/material/Button'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto'
import { ReactElement } from 'react'
import Box from '@mui/material/Box'

export function ImageUpload(): ReactElement {
  return (
    <Box
      sx={{
        justifyContent: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        '& .MuiBox-root': {
          minHeight: 172,
          maxHeight: 172,
          minWidth: 280,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column-reverse',
          justifyContent: 'flex-end',
          pt: 1.5
        }
      }}
    >
      <DropzoneArea
        acceptedFiles={['image/*']}
        filesLimit={1}
        dropzoneText="Drop Image Here"
        showPreviewsInDropzone={false}
        fileObjects
      />

      <Button
        variant="outlined"
        color="inherit"
        component="label"
        startIcon={<InsertPhotoIcon />}
        sx={{
          position: 'absolute',
          zIndex: 1,
          mt: 20,
          height: 32
        }}
      >
        Choose a file
        <input hidden accept="image/*" multiple type="file" />
      </Button>
    </Box>
  )
}
