import { ReactElement, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { gql, useMutation } from '@apollo/client'
import fetch from 'node-fetch'
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined'
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { CreateCloudflareUploadByFile } from '../../../../../../__generated__/CreateCloudflareUploadByFile'

export const CREATE_CLOUDFLARE_UPLOAD_BY_FILE = gql`
  mutation CreateCloudflareUploadByFile {
    createCloudflareUploadByFile {
      uploadUrl
      id
    }
  }
`

interface ImageUploadProps {
  onChange: (src: string) => void
  loading?: boolean
}

export function ImageUpload({
  onChange,
  loading
}: ImageUploadProps): ReactElement {
  const [createCloudflareUploadByFile] =
    useMutation<CreateCloudflareUploadByFile>(CREATE_CLOUDFLARE_UPLOAD_BY_FILE)
  const [success, setSuccess] = useState<boolean>()

  const onDrop = async (acceptedFiles): Promise<void> => {
    const { data } = await createCloudflareUploadByFile({})

    if (data?.createCloudflareUploadByFile?.uploadUrl != null) {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.set('file', file)

      const response = await (
        await fetch(data?.createCloudflareUploadByFile?.uploadUrl, {
          method: 'POST',
          body: formData
        })
      ).json()

      response.success === true ? setSuccess(true) : setSuccess(false)
      if (response.errors.length !== 0) {
        setSuccess(false)
      }

      const src = `https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/${
        response.result.id as string
      }/public`
      onChange(src)
    }
  }

  const { getRootProps, open, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    maxSize: 10485760,
    accept: {
      'image/*': []
    }
  })

  return (
    <Stack {...getRootProps()} alignItems="center" sx={{ px: 6, pt: 3 }}>
      <input {...getInputProps()} />
      <Box
        data-testid="drop zone"
        sx={{
          mt: 3,
          width: '100%',
          height: '162px',
          borderWidth: success == null ? '2px' : '0px',
          backgroundColor:
            success === false && loading === false
              ? 'rgba(195,44,57,0.08)'
              : 'background.default',
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
        {loading === false && success === true ? (
          <CloudDoneOutlinedIcon
            sx={{ fontSize: '48px', color: 'success.main', mb: 1 }}
          />
        ) : loading === false && success === false ? (
          <CloudOffOutlinedIcon
            sx={{ fontSize: '48px', color: '#C52D3A', mb: 1 }}
          />
        ) : (
          <BackupOutlinedIcon
            sx={{ fontSize: '48px', color: 'secondary.light', mb: 1 }}
          />
        )}
        <Typography
          variant="body1"
          color={
            success === true && loading === false
              ? 'success.main'
              : success === false && loading === false
              ? 'error.main'
              : 'secondary.main'
          }
          sx={{ pb: 4 }}
        >
          {loading === false && success === true
            ? 'Upload successful!'
            : loading === true
            ? 'Uploading...'
            : success === false
            ? 'Upload Failed!'
            : 'Drop an image here'}
        </Typography>
      </Box>
      <Stack
        direction="row"
        color={
          success === false && loading === false
            ? 'error.main'
            : 'secondary.light'
        }
        alignItems="center"
      >
        <WarningAmberOutlinedIcon
          fontSize="small"
          sx={{
            display: success === false && loading === false ? 'flex' : 'none'
          }}
        />
        <Typography variant="caption">
          {success === false && loading === false
            ? 'Something went wrong, try again'
            : 'Max file size: 10 MB'}
        </Typography>
      </Stack>
      <Button
        size="small"
        variant="outlined"
        onClick={open}
        color="secondary"
        sx={{
          mt: 6,
          height: '32px',
          width: '100%',
          borderColor: 'secondary.light',
          borderWidth: '1px',
          borderRadius: '8px'
        }}
      >
        <Typography
          variant="subtitle2"
          fontSize="14px"
          sx={{ color: 'secondary.main' }}
        >
          Upload file
        </Typography>
      </Button>
    </Stack>
  )
}
