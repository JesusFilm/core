import { ReactElement, useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'

export function ImageUpload(): ReactElement {
  const onDrop = useCallback((acceptedFiles) => {
    handleMessage(acceptedFiles[0].name)
  }, [])

  const { getRootProps, open, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      noClick: true,
      maxFiles: 1,
      accept: {
        'image/jpeg': [],
        'image/png': [],
        'image/jpg': []
      }
    })

  function handleMessage(fileName: string): void {
    setMessage(fileName)
  }

  const [message, setMessage] = useState('Drop an image here or')

  const style = useMemo(() => {
    const activeStyle = {
      borderColor: '#ffffff'
    }

    const acceptStyle = {
      borderColor: '#005a9c'
    }

    const rejectStyle = {
      borderColor: '#ff1744'
    }

    return {
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }
  }, [isDragActive, isDragAccept, isDragReject])

  return (
    <Box
      {...getRootProps({ style })}
      data-testid="drop zone"
      sx={{
        mt: 3,
        minHeight: '217px',
        borderWidth: '2px',
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        borderStyle: 'dashed',
        borderRadius: '0.5rem',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        alignItems: 'center',
        display: 'flex'
      }}
    >
      <CloudUploadIcon fontSize="large" sx={{ color: 'secondary.light' }} />
      <Typography variant="body1" sx={{ pb: 4 }}>
        {message}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        color="secondary"
        onClick={open}
        startIcon={<ImageIcon />}
      >
        Choose a file
      </Button>
    </Box>
  )
}
