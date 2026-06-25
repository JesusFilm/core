import { useApolloClient } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type FormDataType from 'form-data'
import { useTranslation } from 'next-i18next/pages'
import fetch from 'node-fetch'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { ErrorCode, FileRejection, useDropzone } from 'react-dropzone'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertTriangleIcon from '@core/shared/ui/icons/AlertTriangle'
import CheckBrokenIcon from '@core/shared/ui/icons/CheckBroken'
import Upload1IconIcon from '@core/shared/ui/icons/Upload1'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../__generated__/globalTypes'
import { useAuth } from '../../../../../../../../libs/auth'
import {
  sendImageUploadFailureEvent,
  sendImageUploadSuccessEvent
} from '../../../../../../../../libs/sendImageUploadEvent'
import { useCloudflareUploadByFileMutation } from '../../../../../../../../libs/useCloudflareUploadByFileMutation'
import { MAX_IMAGE_UPLOAD_BYTES } from '../../../../../../../../libs/useImageUpload'
import { UploadDropZoneShell } from '../../../UploadDropZoneShell'
import { prependCloudflareImage } from '../../MediaLibrary/prependCloudflareImage'

interface ImageUploadProps {
  onChange: (input: ImageBlockUpdateInput) => void
  setUploading?: (uploading?: boolean) => void
  onUploaded?: () => void
  selectedBlock?: ImageBlock | null
  loading?: boolean
  error?: boolean
}

export function ImageUpload({
  onChange,
  selectedBlock,
  setUploading,
  onUploaded,
  loading,
  error
}: ImageUploadProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { cache } = useApolloClient()
  const { journey } = useJourney()
  const { user } = useAuth()
  const [createCloudflareUploadByFile] = useCloudflareUploadByFileMutation()
  const [success, setSuccess] = useState<boolean | undefined>(undefined)
  const [errorCode, setErrorCode] = useState<ErrorCode>()
  const successResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  useEffect(() => {
    setErrorCode(undefined)
  }, [selectedBlock])

  useEffect(() => {
    return () => {
      if (successResetTimerRef.current != null) {
        clearTimeout(successResetTimerRef.current)
      }
    }
  }, [])

  async function handleDrop(
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ): Promise<void> {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      const rejectionCode = rejection.errors[0].code as ErrorCode
      setErrorCode(rejectionCode)
      setUploading?.(false)
      setSuccess(false)
      sendImageUploadFailureEvent({
        fileSize: rejection.file.size,
        fileType: rejection.file.type,
        errorCode: rejectionCode
      })
      return
    }
    const { data } = await createCloudflareUploadByFile({
      variables: { journeyId: journey?.id }
    })
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
            fileSize: file.size,
            fileType: file.type,
            errorCode: String(cloudflareError)
          })
          return
        }

        const cloudflareId = response?.result?.id
        const cloudflareUploadKey =
          process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY
        if (
          cloudflareId == null ||
          cloudflareUploadKey == null ||
          cloudflareUploadKey === ''
        ) {
          setSuccess(false)
          setUploading?.(false)
          sendImageUploadFailureEvent({
            fileSize: file.size,
            fileType: file.type,
            errorCode: 'upload-invalid-response'
          })
          return
        }
        const url = `https://imagedelivery.net/${cloudflareUploadKey}/${cloudflareId}`
        // Only prepend optimistically when the uploader is known. Writing a
        // placeholder userId would later compare unequal to the resolved user
        // id and mislabel the caller's own upload as a teammate's "Team" tile.
        if (user?.id != null) {
          prependCloudflareImage(
            cache,
            { id: cloudflareId, url, blurhash: null, userId: user.id },
            false
          )
        }
        onUploaded?.()
        onChange({
          src: `${url}/public`,
          scale: 100,
          focalLeft: 50,
          focalTop: 50
        })
        if (successResetTimerRef.current != null) {
          clearTimeout(successResetTimerRef.current)
        }
        successResetTimerRef.current = setTimeout(
          () => setSuccess(undefined),
          4000
        )
        setUploading?.(undefined)
        sendImageUploadSuccessEvent({
          fileSize: file.size,
          fileType: file.type
        })
      } catch {
        setSuccess(false)
        setUploading?.(false)
        sendImageUploadFailureEvent({
          fileSize: file.size,
          fileType: file.type,
          errorCode: 'upload-exception'
        })
      }
    }
  }

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop: handleDrop,
    noClick: true,
    maxSize: MAX_IMAGE_UPLOAD_BYTES,
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
            <Typography variant="body1" color="secondary.main">
              {t('Drop an image here')}
            </Typography>
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
