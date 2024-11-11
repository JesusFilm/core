import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ReactElement, useReducer, useState } from 'react'
import { Accept, useDropzone } from 'react-dropzone'
import Upload1Icon from '@core/shared/ui/icons/Upload1'

const reducer = (state, action) => {}

interface FileUploadProps {
  onDrop: (file: File) => Promise<void>
  accept?: Accept
}

export function FileUpload({
  onDrop: onDropCallback,
  accept
}: FileUploadProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    uploading: false,
    processing: false,
    rejected: false,
    errors: []
  })
  const [progress, setProgress] = useState(0)

  const onDrop = async (files: File[]): Promise<void> => {
    if (files.length <= 0) return
    // dispatch('Uploading')

    await onDropCallback(files[0])
  }

  const onDropAccepted = () => {}
  const onDropRejected = () => {}

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    onDropAccepted,
    onDropRejected,
    noClick: true,
    multiple: false,
    maxSize: 10000000,
    accept
  })

  const noBorder = state.error != null || state.uploading || state.rejected

  return (
    <Stack alignItems="center" gap={2}>
      <Box
        data-testid="drop zone"
        sx={{
          mt: 3,
          display: 'flex',
          width: '100%',
          height: 240,
          borderWidth: noBorder ? undefined : 2,
          backgroundColor:
            isDragAccept || state.uploading
              ? 'rgba(239, 239, 239, 0.9)'
              : state.error != null || state.rejected
              ? 'rgba(197, 45, 58, 0.08)'
              : 'background.paper',
          borderColor: 'divider',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 1,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        {...getRootProps({ isDragAccept })}
      >
        <input {...getInputProps()} />
        <Upload1Icon />
      </Box>
      <Button variant="outlined" fullWidth onClick={open}>
        Upload file
      </Button>
    </Stack>
  )
}
