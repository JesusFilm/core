import { ReactElement, useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'

export function ImageUpload(): ReactElement {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // TODO: Cloudflare Implementation
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
      sx={{
        mt: 3,
        borderWidth: '2px',
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        borderStyle: 'dashed',
        borderRadius: '0.5rem',
        textAlign: 'center',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Box>
        <CloudUploadIcon fontSize="large" sx={{ color: 'secondary.light' }} />
        <Typography variant="body1" sx={{ pb: 4 }}>
          Drop an image here or
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={open}
          startIcon={<ImageIcon />}
        >
          Browse files
        </Button>
      </Box>
    </Box>
  )
}
