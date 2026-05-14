import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type FormDataType from 'form-data'
import { useTranslation } from 'next-i18next/pages'
import fetch from 'node-fetch'
import { ReactElement, useEffect, useState } from 'react'
import { ErrorCode, FileRejection, useDropzone } from 'react-dropzone'

import AlertTriangleIcon from '@core/shared/ui/icons/AlertTriangle'
import CheckBrokenIcon from '@core/shared/ui/icons/CheckBroken'
import Upload1IconIcon from '@core/shared/ui/icons/Upload1'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../__generated__/globalTypes'
import {
  sendImageUploadFailureEvent,
  sendImageUploadSuccessEvent
} from '../../../../../../../../libs/sendImageUploadEvent'
import { useCloudflareUploadByFileMutation } from '../../../../../../../../libs/useCloudflareUploadByFileMutation'
import { UploadDropZoneShell } from '../../../UploadDropZoneShell'

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
      const rejection = rejectedFiles[0]
      const rejectionCode = rejection.errors[0].code as ErrorCode
      setErrorCode(rejectionCode)
      setUploading?.(false)
      setSuccess(false)
      sendImageUploadFailureEvent({
        fileName: rejection.file.name,
        fileSize: rejection.file.size,
        fileType: rejection.file.type,
        errorCode: rejectionCode
      })
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
          sendImageUploadFailureEvent({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            errorCode: String(cloudflareError)
          })
          return
        }

        const src = `https://imagedelivery.net/${
          process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
        }/${response.result.id as string}/public`
        onChange({ src, scale: 100, focalLeft: 50, focalTop: 50 })
        setTimeout(() => setSuccess(undefined), 4000)
        setUploading?.(undefined)
        sendImageUploadSuccessEvent({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
      } catch {
        setSuccess(false)
        sendImageUploadFailureEvent({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
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
  const hasError = error === true || errorCode != null

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
      <UploadDropZoneShell
        data-testid="drop zone"
        isDragAccept={isDragAccept}
        isActive={loading === true}
        hasError={hasError}
        noBorder={loading === true || uploadSuccess || hasError}
      >
        {loading || (!uploadSuccess && !hasError) ? (
          <Upload1IconIcon
            sx={{
              display: { xs: 'none', sm: 'flex' },
              fontSize: 30,
              color: 'secondary.light'
            }}
          />
        ) : uploadSuccess ? (
          <CheckBrokenIcon
            sx={{
              display: { xs: 'none', sm: 'flex' },
              fontSize: 30,
              color: 'success.main'
            }}
          />
        ) : (
          <AlertTriangleIcon
            sx={{
              display: { xs: 'none', sm: 'flex' },
              fontSize: 30,
              color: 'primary.main'
            }}
          />
        )}
        <Stack alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {loading || uploadSuccess || hasError ? (
            <Typography
              variant="body1"
              color={
                loading
                  ? 'secondary.main'
                  : uploadSuccess
                    ? 'success.main'
                    : 'error.main'
              }
            >
              {loading
                ? t('Uploading...')
                : uploadSuccess
                  ? t('Upload Successful!')
                  : t('Upload Failed!')}
            </Typography>
          ) : (
            <>
              <Typography variant="body1" color="secondary.main">
                {t('Drop an image here')}
              </Typography>
              <Typography variant="caption" color="secondary.main">
                {t('or click to browse your files')}
              </Typography>
            </>
          )}
        </Stack>
        <Button
          variant="blockOutlined"
          color="solid"
          size="small"
          disabled={loading === true}
          onClick={open}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: 160 }
          }}
        >
          {t('Upload file')}
        </Button>
      </UploadDropZoneShell>
      <Stack
        direction="row"
        spacing={1}
        color={hasError ? 'error.main' : 'secondary.light'}
        sx={{ mt: 1, alignItems: 'flex-start' }}
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
    </Stack>
  )
}
