import { supportsResultCaching } from '@apollo/client/cache/inmemory/entityStore'
import {
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'
import useDownloader from 'react-use-downloader'

import { Dialog } from '@core/shared/ui/Dialog'
import Download2 from '@core/shared/ui/icons/Download2'
import Trash2 from '@core/shared/ui/icons/Trash2'
import Upload2 from '@core/shared/ui/icons/Upload2'

function generateFileName(videoId, subtitle) {
  const language = subtitle.language.slug
  const exp = /(?:\.([^.]+))?$/

  const extension = exp.exec(subtitle.srtSrc)?.[1]
  console.log(extension)
  return `${videoId}_${language}.${extension}`
}

export function Subtitles({ subtitles, videoId }): ReactElement {
  const t = useTranslations()
  const { download, isInProgress } = useDownloader()
  const [subtitle, setSubtitle] = useState(null)

  const handleDownloadClick = (subtitle): void => {
    setSubtitle(subtitle)
  }

  const handleClose = (): void => {
    setSubtitle(null)
  }

  const handleDownload = () => {
    console.log({ url: subtitle.srtSrc, bar: subtitle.vttSrc })
    if (subtitle == null) return

    const fileName = generateFileName(videoId, subtitle)

    void download(subtitle.srtSrc, fileName)
  }

  console.log('download progress', isInProgress)

  return (
    <Stack>
      <Typography variant="h4">{t('Subtitles')}</Typography>
      <pre>{JSON.stringify(subtitles, null, 2)}</pre>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('Edition')}</TableCell>
              <TableCell>{t('Language')}</TableCell>
              <TableCell>{t('Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subtitles.map((subtitle) => (
              <TableRow key={subtitle.id}>
                <TableCell>{subtitle.edition}</TableCell>
                <TableCell>{subtitle.language.name[0].value}</TableCell>
                <TableCell>
                  <Stack direction="row" gap={0.75}>
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadClick(subtitle)}
                    >
                      <Download2 />
                    </IconButton>

                    <IconButton size="small">
                      <Upload2 />
                    </IconButton>

                    <IconButton size="small">
                      <Trash2 />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <DownloadDialog /> */}

      <Dialog
        open={subtitle != null}
        dialogTitle={{ title: t('Download Subtitle'), closeButton: true }}
        onClose={handleClose}
      >
        <pre>{JSON.stringify(subtitle, null, 2)}</pre>
        <Button onClick={handleDownload}>Download</Button>
      </Dialog>
    </Stack>
  )
}
