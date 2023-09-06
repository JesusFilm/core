import { gql, useMutation } from '@apollo/client'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined' // icon-replace: no icon serves similar purpose
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined' // icon-replace: no icon serves similar purpose
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded' // icon-replace: no icon serves similar purpose
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded' // icon-replace: add alert-triangle
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type FormDataType from 'form-data'
import fetch from 'node-fetch'
import { ReactElement, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { CreateCloudflareUploadByFile } from '../../../../../../__generated__/CreateCloudflareUploadByFile'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'

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
  setUploading?: (uploading?: boolean) => void
  selectedBlock: ImageBlock | null
  loading?: boolean
  error?: boolean
}

export function ImageUpload({
  onChange,
  selectedBlock,
  setUploading,
  loading,
  error
}: ImageUploadProps): ReactElement {
  const [createCloudflareUploadByFile] =
    useMutation<CreateCloudflareUploadByFile>(CREATE_CLOUDFLARE_UPLOAD_BY_FILE)
  const [success, setSuccess] = useState<boolean>()

  const onDrop = async (acceptedFiles: File[]): Promise<void> => {
    const { data } = await createCloudflareUploadByFile({})
    setUploading?.(true)

    if (data?.createCloudflareUploadByFile?.uploadUrl != null) {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await (
          await fetch(data?.createCloudflareUploadByFile?.uploadUrl, {
            method: 'POST',
            body: formData as unknown as FormDataType
          })
        ).json()

        response.success === true ? setSuccess(true) : setSuccess(false)
        if (response.errors.length !== 0) {
          setSuccess(false)
        }

        const src = `https://imagedelivery.net/${
          process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
        }/${response.result.id as string}/public`
        onChange(src)
        setTimeout(() => setSuccess(undefined), 4000)
        setUploading?.(undefined)
      } catch (e) {
        setSuccess(false)
      }
    }
  }

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    noClick: true,
    maxSize: 10485760,
    accept: {
      'image/*': []
    }
  })

  const uploadSuccess =
    success === true && selectedBlock?.src != null && loading === false
  const uploadError = error === true || success === false
  const noBorder = uploadSuccess || uploadError || loading === true

  return (
    <Stack
      {...getRootProps({ isDragAccept })}
      alignItems="center"
      gap={1}
      sx={{ px: 6, py: 3 }}
    >
      <input {...getInputProps()} />
      <Box
        data-testid="drop zone"
        sx={{
          mt: 3,
          display: 'flex',
          width: '100%',
          height: 162,
          borderWidth: noBorder ? undefined : 2,
          backgroundColor:
            isDragAccept || loading === true
              ? 'rgba(239, 239, 239, 0.9)'
              : uploadError
              ? 'rgba(197, 45, 58, 0.08)'
              : 'rgba(239, 239, 239, 0.35)',
          borderColor: 'divider',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 2,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {uploadSuccess ? (
          <CloudDoneOutlinedIcon
            sx={{ fontSize: 48, color: 'success.main', mb: 1 }}
          />
        ) : uploadError ? (
          <CloudOffRoundedIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
          />
        ) : (
          <BackupOutlinedIcon
            sx={{ fontSize: 48, color: 'secondary.light', mb: 1 }}
          />
        )}
        <Typography
          variant="body1"
          color={
            uploadSuccess
              ? 'success.main'
              : uploadError
              ? 'error.main'
              : 'secondary.main'
          }
          sx={{ pb: 4 }}
        >
          {loading === true
            ? 'Uploading...'
            : uploadSuccess
            ? 'Upload successful!'
            : uploadError
            ? 'Upload Failed!'
            : 'Drop an image here'}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={uploadError ? 'error.main' : 'secondary.light'}
      >
        <WarningAmberRounded
          fontSize="small"
          sx={{
            display: uploadError ? 'flex' : 'none'
          }}
        />
        <Typography variant="caption">
          {uploadError
            ? 'Something went wrong, try again'
            : 'Max file size: 10 MB'}
        </Typography>
      </Stack>
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        disabled={loading === true}
        onClick={open}
        sx={{
          mt: 4,
          height: 32,
          width: '100%',
          borderRadius: 2
        }}
      >
        <Typography
          variant="subtitle2"
          fontSize={14}
          sx={{ color: 'secondary.main' }}
        >
          Upload file
        </Typography>
      </Button>
    </Stack>
  )
}
