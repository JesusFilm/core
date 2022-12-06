import useDownloader from 'react-use-downloader'
import { Dialog } from '@core/shared/ui/Dialog'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { ReactElement, useState } from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormGroup from '@mui/material/FormGroup'

import { VideoContentFields_variant_downloads as Downloads } from '../../../__generated__/VideoContentFields'

interface DownloadDialogProps {
  downloads: Downloads[]
  open?: boolean
  title: string
  onClose: () => void
}

function formatBytes(bytes, decimals = 2): string {
  if ((bytes ?? 0) <= 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function DownloadDialog({
  open = false,
  downloads,
  title,
  onClose
}: DownloadDialogProps): ReactElement {
  const [selectedUrl, setSelectedUrl] = useState(downloads[0].url)
  const [termsAgreed, setTermsAgreed] = useState(true)
  const { size, percentage, download, cancel, error, isInProgress } =
    useDownloader()

  if (percentage === 100) {
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        cancel()
        onClose()
      }}
      dialogTitle={{
        title: 'Download this video',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: () => {
          if (termsAgreed) {
            void download(selectedUrl, `${title}.mp4`)
          }
        },
        submitLabel: 'Download',
        closeLabel: 'Cancel'
      }}
      divider
    >
      <>
        {isInProgress && (
          <>
            <p>Preparing..</p>
            <p>Download size in bytes {formatBytes(size)}</p>
            <label htmlFor="file">Downloading progress:</label>
            <progress id="file" value={percentage} max="100" />
            {error != null && <p>possible error {JSON.stringify(error)}</p>}
          </>
        )}

        {!isInProgress && (
          <FormGroup>
            <FormControl variant="filled">
              <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
                Select a File size
              </InputLabel>

              <Select
                onChange={(e) => setSelectedUrl(e.target.value)}
                defaultValue={downloads[0].url}
              >
                {downloads.map((download) => (
                  <MenuItem value={download.url} key={download.quality}>
                    {download.quality} ({formatBytes(download.size)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                />
              }
              label="I have read the Terms of Use and I agree to them."
            />
          </FormGroup>
        )}
      </>
    </Dialog>
  )
}
