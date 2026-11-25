import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'

import { Sha256 } from '@aws-crypto/sha256-js'

import {
  imageByteLimit,
  videoByteLimit,
  uploadChunkBytes,
  type MediaJobState
} from '@core/yoga/mcp/mediaJobContract'

import { useAuth } from '../../libs/auth'

interface UploadStatus {
  jobId: string
  journeyId: string
  clientId: string
  mediaKind: string
  state: MediaJobState
  transferDeadline: string
  receivedBytes: number
  code?: string
  file?: { name: string; size: number; sha256: string } | null
}
const hash = async (bytes: ArrayBuffer) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    (value) => value.toString(16).padStart(2, '0')
  ).join('')

export function McpImageUpload({
  endpoint
}: {
  endpoint: string
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const token = user?.token
  const anonymous = user?.isAnonymous
  const [job, setJob] = useState<UploadStatus>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const request = useCallback(
    async (
      method = 'GET',
      action?: string,
      body?: BodyInit,
      extra?: Record<string, string>
    ) => {
      if (!token || anonymous) throw new Error('Access denied')
      const response = await fetch(endpoint, {
        method,
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
        headers: {
          Authorization: `JWT ${token}`,
          ...(action ? { 'X-Upload-Action': action } : {}),
          ...extra
        },
        body
      })
      const value = (await response.json()) as { data?: UploadStatus }
      if (!response.ok || !value.data || value.data.code)
        throw new Error('Access denied')
      setJob(value.data)
      return value.data
    },
    [endpoint, token, anonymous]
  )
  useEffect(() => {
    let active = true
    const refresh = () => {
      if (active)
        void request().catch(() => {
          if (active) setError(true)
        })
    }
    refresh()
    const timer = setInterval(refresh, 5000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [request])
  const handleResume = async () => {
    if (busy) return
    setBusy(true)
    setError(false)
    try {
      await request('POST', 'resume')
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || busy) return
    setBusy(true)
    setError(false)
    try {
      if (
        file.size >
          (job?.mediaKind === 'video_upload'
            ? videoByteLimit
            : imageByteLimit) ||
        file.size === 0
      )
        throw new Error('Invalid file')
      const digest = new Sha256()
      for (let offset = 0; offset < file.size; offset += uploadChunkBytes) {
        digest.update(
          new Uint8Array(
            await file.slice(offset, offset + uploadChunkBytes).arrayBuffer()
          )
        )
      }
      const manifest = {
        name: file.name,
        mime: file.type,
        size: file.size,
        sha256: Array.from(await digest.digest(), (value) =>
          value.toString(16).padStart(2, '0')
        ).join('')
      }
      let status = await request('POST', 'bind', JSON.stringify(manifest), {
        'Content-Type': 'application/json'
      })
      while (status.receivedBytes < file.size) {
        const offset = status.receivedBytes
        const chunk = await file
          .slice(offset, Math.min(file.size, offset + uploadChunkBytes))
          .arrayBuffer()
        status = await request('PUT', undefined, chunk, {
          'Content-Type': 'application/octet-stream',
          'X-Upload-Offset': String(offset),
          'X-Upload-Sha256': await hash(chunk)
        })
        if (status.receivedBytes <= offset)
          throw new Error('Chunk acknowledgement pending')
      }
      await request('POST', 'resume')
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Stack spacing={2} sx={{ maxWidth: 640, mx: 'auto', p: 3 }}>
      <Typography variant="h4">
        {job?.mediaKind === 'video_upload'
          ? t('Upload a video')
          : t('Upload an image')}
      </Typography>
      {error && (
        <Alert severity="error">
          {t(
            'Upload unavailable. Your original job and deadline are preserved. Check your connection access before trying again.'
          )}
        </Alert>
      )}
      {job && (
        <>
          <Typography>
            {t('Requested by {{client}} for journey {{journey}}', {
              client: job.clientId,
              journey: job.journeyId
            })}
          </Typography>
          <Typography>
            {t('Transfer deadline: {{deadline}}', {
              deadline: job.transferDeadline
            })}
          </Typography>
          <Typography role="status">
            {job.state === 'ready'
              ? t(
                  'Ready in your media library. Return to your chat to attach it with a separate draft save.'
                )
              : job.state === 'provider_allocated' ||
                  job.state === 'processing' ||
                  job.state === 'reconciling' ||
                  job.state === 'cancel_requested'
                ? t(
                    'Provider processing or reconciliation is pending. No media is attached.'
                  )
                : job.state === 'validating' || job.state === 'dispatch_pending'
                  ? t(
                      'Transfer complete. Validation and provider dispatch are pending.'
                    )
                  : job.state === 'transferring'
                    ? t('Uploading your file')
                    : job.state === 'waiting_for_file'
                      ? t('Waiting for one file')
                      : t('This upload has ended.')}
          </Typography>
          {busy && (
            <LinearProgress
              variant={job.file ? 'determinate' : 'indeterminate'}
              value={
                job.file ? (job.receivedBytes / job.file.size) * 100 : undefined
              }
            />
          )}
          {['waiting_for_file', 'transferring'].includes(job.state) && (
            <Button component="label" disabled={busy} variant="contained">
              {t('Choose the same file to upload or resume')}
              <Box
                component="input"
                type="file"
                hidden
                accept={
                  job.mediaKind === 'video_upload'
                    ? 'video/mp4,video/quicktime'
                    : 'image/png,image/jpeg,image/webp,image/gif'
                }
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  void handleFile(event)
                }}
              />
            </Button>
          )}
          {['validating', 'dispatch_pending'].includes(job.state) && (
            <Button
              disabled={busy}
              variant="contained"
              onClick={() => {
                void handleResume()
              }}
            >
              {job.mediaKind === 'video_upload'
                ? t('Resume video processing')
                : t('Resume image processing')}
            </Button>
          )}
          {!['ready', 'cancelled', 'failed', 'transfer_expired'].includes(
            job.state
          ) && (
            <Button
              disabled={busy}
              onClick={() => {
                void request('POST', 'cancel').catch(() => setError(true))
              }}
            >
              {t('Cancel upload')}
            </Button>
          )}
        </>
      )}
    </Stack>
  )
}
