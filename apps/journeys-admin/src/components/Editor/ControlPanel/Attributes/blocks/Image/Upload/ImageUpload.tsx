import { ReactElement, useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Button from '@mui/material/Button'
import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'

const useStyles = makeStyles(() => ({
  dropArea: {
    borderWidth: '2px',
    backgroundColor: '#F9F9F9',
    borderColor: '#DEDFE0',
    borderStyle: 'dashed',
    borderRadius: '0.5rem',
    textAlign: 'center',
    alignItems: 'center',
    minHeight: 217,
    minWidth: 512,
    display: 'flex',
    justifyContent: 'center'
  }
}))

export function ImageUpload(): ReactElement {
  const classes = useStyles()

  const onDrop = useCallback((acceptedFiles) => {
    console.log('AAAAAAAAAAAAAA')
  }, [])

  const { getRootProps, open, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      noClick: true,
      maxFiles: 1,
      accept: {
        'image/jpeg': [],
        'image/png': [],
        'image/jpg': [],
        'image/gif': []
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
    <Box {...getRootProps({ style })} className={classes.dropArea}>
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
          onDrop={onDrop}
        >
          Browse files
        </Button>
      </Box>
    </Box>
  )
}
