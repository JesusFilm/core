import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, useState } from 'react'

import Upload1Icon from '@core/shared/ui/icons/Upload1'

import { useCloudflareUploadByUrlMutation } from '../../../../libs/useCloudflareUploadByUrlMutation'
import { useImageUpload } from '../../../../libs/useImageUpload'
import { messageOf } from '../../utils/useCampaignStyleCommand'

/** The editor's pure URL rule for a pasted image: an absolute https address. The server checks the rest. */
export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value.trim()).protocol === 'https:'
  } catch {
    return false
  }
}

interface Candidate {
  /** The address shown in the preview. */
  src: string
  /** A pasted address still on its own host, to be fetched into Cloudflare when kept. */
  pasted: boolean
}

interface ImagePickerProps {
  /** The campaign's team: every upload and fetched paste is recorded under it. */
  teamId: string
  /** One call with the stored (imagedelivery.net) address when the author keeps an image. */
  onPick: (src: string) => void
  /** The keep button's label; defaults to "Use image". */
  pickLabel?: string
  testId?: string
}

/**
 * The only two ways an image enters a campaign (PRD §5): upload a file, or
 * paste an image URL — no library browsing. A paste is checked for the https
 * shape here and shown resolved before it is kept; keeping it fetches the
 * picture into Cloudflare under the team, so what `onPick` receives is always
 * an imagedelivery.net address. An upload goes through `useImageUpload` with
 * the team and is shown the same way before it is kept.
 */
export function ImagePicker({
  teamId,
  onPick,
  pickLabel,
  testId = 'CampaignImagePicker'
}: ImagePickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [url, setUrl] = useState('')
  const [candidate, setCandidate] = useState<Candidate>()
  const [error, setError] = useState<string>()
  const [keeping, setKeeping] = useState(false)
  const [uploadByUrl] = useCloudflareUploadByUrlMutation()
  const { getRootProps, getInputProps, open, loading, isDragAccept } =
    useImageUpload({
      teamId,
      onUploadStart() {
        setError(undefined)
      },
      onUploadComplete(src) {
        setCandidate({ src, pasted: false })
      },
      onUploadError(_code, message) {
        setError(message)
      }
    })

  const urlValid = url.trim() === '' || isHttpsUrl(url)

  function handleUrlChange(event: ChangeEvent<HTMLInputElement>): void {
    setUrl(event.target.value)
    setError(undefined)
  }

  function handlePreview(): void {
    if (!isHttpsUrl(url)) return
    setError(undefined)
    setCandidate({ src: url.trim(), pasted: true })
  }

  async function handleKeep(): Promise<void> {
    if (candidate == null) return
    if (!candidate.pasted) {
      onPick(candidate.src)
      return
    }
    setKeeping(true)
    setError(undefined)
    try {
      const { data } = await uploadByUrl({
        variables: { url: candidate.src, teamId }
      })
      const stored = data?.createCloudflareUploadByUrl.url
      if (stored == null) throw new Error(t('The image could not be fetched'))
      onPick(`${stored}/public`)
    } catch (fetchError: unknown) {
      setError(messageOf(fetchError))
    } finally {
      setKeeping(false)
    }
  }

  return (
    <Stack spacing={3} data-testid={testId}>
      <Box
        {...getRootProps()}
        data-testid={`${testId}Drop`}
        sx={{
          p: 3,
          border: '1px dashed',
          borderColor: isDragAccept ? 'primary.main' : 'divider',
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <input {...getInputProps()} data-testid={`${testId}FileInput`} />
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <Upload1Icon />}
          disabled={loading}
          onClick={open}
        >
          {loading ? t('Uploading…') : t('Upload a file')}
        </Button>
        <Typography
          variant="caption"
          component="p"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {t('PNG, JPG, GIF, SVG or HEIC, up to 10 MB')}
        </Typography>
      </Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <TextField
          label={t('Image URL')}
          value={url}
          onChange={handleUrlChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handlePreview()
            }
          }}
          error={!urlValid}
          helperText={urlValid ? undefined : t('Enter an https:// image link')}
          size="small"
          fullWidth
          slotProps={{ htmlInput: { 'data-testid': `${testId}Url` } }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handlePreview}
          disabled={url.trim() === '' || !urlValid}
          sx={{ mt: 0.5, whiteSpace: 'nowrap' }}
        >
          {t('Preview')}
        </Button>
      </Stack>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      {candidate != null && (
        <Stack spacing={2} data-testid={`${testId}Preview`}>
          <Box
            component="img"
            src={candidate.src}
            alt=""
            data-testid={`${testId}PreviewImage`}
            onError={() => setError(t('That link is not an image'))}
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              borderRadius: 1,
              bgcolor: 'action.hover'
            }}
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="small"
              onClick={handleKeep}
              disabled={keeping || error != null}
              startIcon={keeping ? <CircularProgress size={16} /> : undefined}
            >
              {pickLabel ?? t('Use image')}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setCandidate(undefined)
                setError(undefined)
              }}
            >
              {t('Cancel')}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}
