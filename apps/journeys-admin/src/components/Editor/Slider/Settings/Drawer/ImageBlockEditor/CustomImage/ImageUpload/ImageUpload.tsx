import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type FormDataType from 'form-data'
import { useTranslation } from 'next-i18next'
import fetch from 'node-fetch'
import { ReactElement, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import AlertTriangleIcon from '@core/shared/ui/icons/AlertTriangle'
import CheckBrokenIcon from '@core/shared/ui/icons/CheckBroken'
import Upload1IconIcon from '@core/shared/ui/icons/Upload1'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../__generated__/globalTypes'
import { useCloudflareUploadByFileMutation } from '../../../../../../../../libs/useCloudflareUploadByFileMutation'

interface ImageUploadProps {
  onChange: (input: ImageBlockUpdateInput) => void
  setUploading?: (uploading?: boolean) => void
  selectedBlock?: ImageBlock | null
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
  const [createCloudflareUploadByFile] = useCloudflareUploadByFileMutation()
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
        onChange({ src, scale: 100, focalLeft: 50, focalTop: 50 })
        setTimeout(() => setSuccess(undefined), 4000)
        setUploading?.(undefined)
      } catch {
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

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      {...getRootProps({ isDragAccept })}
      alignItems="center"
      gap={1}
      sx={{ px: 6, py: 3 }}
      data-testid="ImageUpload"
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
          <CheckBrokenIcon
            sx={{ fontSize: 48, color: 'success.main', mb: 1 }}
          />
        ) : uploadError ? (
          <AlertTriangleIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
          />
        ) : (
          <Upload1IconIcon
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
            ? t('Uploading...')
            : uploadSuccess
              ? t('Upload successful!')
              : uploadError
                ? t('Upload Failed!')
                : t('Drop an image here')}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={uploadError ? 'error.main' : 'secondary.light'}
      >
        <AlertTriangleIcon
          fontSize="small"
          sx={{
            display: uploadError ? 'flex' : 'none'
          }}
        />
        <Typography variant="caption">
          {uploadError
            ? t('Something went wrong, try again')
            : t('Max file size: 10 MB')}
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
          {t('Upload file')}
        </Typography>
      </Button>
    </Stack>
  )
}
