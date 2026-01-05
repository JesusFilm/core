import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type FormDataType from 'form-data'
import { useTranslation } from 'next-i18next'
import fetch from 'node-fetch'
import { ReactElement, useEffect, useState } from 'react'
import { ErrorCode, FileRejection, useDropzone } from 'react-dropzone'

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
  const { t } = useTranslation('apps-journeys-admin')
  const [createCloudflareUploadByFile] = useCloudflareUploadByFileMutation()
  const [success, setSuccess] = useState<boolean | undefined>(undefined)
  const [errorCode, setErrorCode] = useState<ErrorCode>()

  useEffect(() => {
    setErrorCode(undefined)
  }, [selectedBlock])

  const onDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ): Promise<void> => {
    if (rejectedFiles.length > 0) {
      setErrorCode(rejectedFiles[0].errors[0].code as ErrorCode)
      setUploading?.(false)
      setSuccess(false)
      return
    }
    const { data } = await createCloudflareUploadByFile({})
    setUploading?.(true)
    setSuccess(undefined)
    setErrorCode(undefined)

    if (data?.createCloudflareUploadByFile?.uploadUrl != null) {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('file', file)

      const uploadUrl = data.createCloudflareUploadByFile.uploadUrl
      try {
        const response = await (
          await fetch(uploadUrl, {
            method: 'POST',
            body: formData as unknown as FormDataType
          })
        ).json()

        response.success === true ? setSuccess(true) : setSuccess(false)
        if (response.errors?.length) {
          const cloudflareError = response.errors[0].code
          setSuccess(false)
          setUploading?.(false)
          setErrorCode(cloudflareError as ErrorCode)
          return
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
      'image/png': [],
      'image/jpeg': [],
      'image/gif': [],
      'image/svg+xml': [],
      'image/heic': []
    }
  })

  const uploadSuccess = success === true && selectedBlock?.src != null
  const hasError = error || errorCode
  const noBorder = loading || uploadSuccess || hasError

  function getErrorMessage(errorCode: ErrorCode | undefined) {
    switch (errorCode) {
      case ErrorCode.FileTooLarge: {
        return t(
          'File size exceeds the maximum allowed size (10 MB). Please choose a smaller file'
        )
      }
      case ErrorCode.FileInvalidType: {
        return t(
          'File type not accepted. Please upload one of the following: (PNG, JPG, GIF, SVG, or HEIC)'
        )
      }
      default: {
        return t('Something went wrong, try again')
      }
    }
  }

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
              : hasError
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
        {loading || (!uploadSuccess && !hasError) ? (
          <Upload1IconIcon
            sx={{ fontSize: 48, color: 'secondary.light', mb: 1 }}
          />
        ) : uploadSuccess ? (
          <CheckBrokenIcon
            sx={{ fontSize: 48, color: 'success.main', mb: 1 }}
          />
        ) : (
          <AlertTriangleIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
          />
        )}
        <Typography
          variant="body1"
          color={
            loading
              ? 'secondary.main'
              : uploadSuccess
                ? 'success.main'
                : hasError
                  ? 'error.main'
                  : 'secondary.main'
          }
          sx={{ pb: 4 }}
        >
          {loading
            ? t('Uploading...')
            : uploadSuccess
              ? t('Upload Successful!')
              : hasError
                ? t('Upload Failed!')
                : t('Drop an image here')}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={hasError ? 'error.main' : 'secondary.light'}
      >
        <AlertTriangleIcon
          fontSize="small"
          sx={{
            display: hasError ? 'flex' : 'none'
          }}
        />
        <Typography variant="caption">
          {hasError
            ? getErrorMessage(errorCode)
            : t(
                'Upload an image (PNG, JPG, GIF, SVG, or HEIC). Maximum file size: 10 MB'
              )}
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
