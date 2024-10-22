import { supportsResultCaching } from '@apollo/client/cache/inmemory/entityStore'
import {
  Box,
  Button,
  CircularProgress,
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
import { ReactElement, useReducer, useState } from 'react'
import useDownloader from 'react-use-downloader'
import { FileRejection, useDropzone } from 'react-dropzone'

import { Dialog } from '@core/shared/ui/Dialog'
import Download2 from '@core/shared/ui/icons/Download2'
import Trash2 from '@core/shared/ui/icons/Trash2'
import Upload2 from '@core/shared/ui/icons/Upload2'
import Upload1Icon from '@core/shared/ui/icons/Upload1'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import ChevronUp from '@core/shared/ui/icons/ChevronUp'
import { graphql } from 'gql.tada'
import { useMutation } from '@apollo/client'

function getFileExtension(path: string): string | null {
  const regex = /(?:\.([^.]+))?$/

  const match = path.match(regex)

  return match != null ? match[1] : null
}

function getFileName(path: string): string | null {
  const fileName = path.match(/[^/]+$/)

  return fileName != null ? fileName[0] : null
}

const UPDATE_VIDEO_SUBTITLE = graphql(`
  mutation UpdateVideoSubtitle($input: VideoSubtitleUpdateInput!) {
    videoSubtitleUpdate(input: $input) {
      id
      value
    }
  }
`)
const reducer = (state, action) => {}

function FileUpload({ subtitle }): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    uploading: false,
    processing: false,
    rejected: false,
    errors: []
  })
  const [progress, setProgress] = useState(0)
  const [updateSubtitle] = useMutation(UPDATE_VIDEO_SUBTITLE)

  const onDrop = async (files: File[]): Promise<void> => {
    if (files.length <= 0) return

    const file = files[0]
    const fileName = file.name.split('.')[0]
    const ext = getFileExtension(file.name)

    console.log({ file, fileName, ext })
    // if (ext !== 'vtt' || ext !== 'srt') return

    const subtitleSrc = ext === 'vtt' ? 'vttSrc' : 'srtSrc'

    void updateSubtitle({
      variables: {
        input: {
          id: subtitle.id,
          edition: subtitle.edition,
          [subtitleSrc]: file.name
        }
      }
    })
  }
  const onDropAccepted = () => {}
  const onDropRejected = () => {}

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    onDropAccepted,
    onDropRejected,
    noClick: true,
    multiple: false,
    maxSize: 10000000,
    accept: {
      'text/vtt': []
    }
  })

  const noBorder = state.error != null || state.uploading || state.rejected

  return (
    <Stack alignItems="center" gap={2}>
      <Box
        data-testid="drop zone"
        sx={{
          mt: 3,
          display: 'flex',
          width: '100%',
          height: 240,
          borderWidth: noBorder ? undefined : 2,
          backgroundColor:
            isDragAccept || state.uploading
              ? 'rgba(239, 239, 239, 0.9)'
              : state.error != null || state.rejected
              ? 'rgba(197, 45, 58, 0.08)'
              : 'background.paper',
          borderColor: 'divider',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 1,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        {...getRootProps({ isDragAccept })}
      >
        <input {...getInputProps()} />
        <Upload1Icon />
      </Box>
      <Button variant="outlined" fullWidth onClick={open}>
        Upload file
      </Button>
    </Stack>
  )
}

function Subtitle({ subtitle, file, extension }): ReactElement {
  const isInProgress = false
  const handleDownload = (s) => {}
  const handleUploadClick = (s) => {}

  return (
    <TableRow>
      <TableCell padding="checkbox" />
      <TableCell colSpan={3}>
        <Stack
          direction="row"
          gap={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography>{file}</Typography>
          <Stack direction="row" gap={0.75}>
            {/* {isInProgress ? (
          <Button
            disabled
            size="small"
            variant="outlined"
            sx={{ width: 'min-content', minWidth: 0, p: '8px' }}
          >
            <CircularProgress size="18px" />
          </Button>
        ) : (
          <IconButton
            size="small"
            onClick={() => handleDownload(subtitle)}
            disabled={isInProgress}
          >
            <Download2 />
          </IconButton>
        )} */}

            <IconButton
              size="small"
              onClick={() => handleDownload(subtitle)}
              disabled={isInProgress}
            >
              <Download2 />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => handleUploadClick(subtitle)}
            >
              <Upload2 />
            </IconButton>

            <IconButton size="small">
              <Trash2 />
            </IconButton>
          </Stack>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

function ExpandableRow({ children, subtitle, ...other }): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <TableRow {...other}>
        <TableCell padding="checkbox">
          <IconButton
            onClick={() => setIsExpanded((prev) => !prev)}
            size="small"
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        {children}
      </TableRow>
      {isExpanded && (
        <>
          {subtitle.vttSrc != null && (
            <Subtitle
              extension={getFileExtension(subtitle.vttSrc)}
              file={getFileName(subtitle.vttSrc)}
              subtitle={subtitle}
            />
          )}
          {subtitle.srtSrc != null && (
            <Subtitle
              extension={getFileExtension(subtitle.srtSrc)}
              file={getFileName(subtitle.srtSrc)}
              subtitle={subtitle}
            />
          )}
        </>
      )}
    </>
  )
}

export function Subtitles({ subtitles, videoId }): ReactElement {
  const t = useTranslations()
  const { download, isInProgress } = useDownloader()
  const [subtitle, setSubtitle] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const handleDownload = (subtitle): void => {
    console.log({ url: subtitle.srtSrc, bar: subtitle.vttSrc })
    if (subtitle == null) return

    const fileName = getFileName(subtitle.value)

    void download(subtitle.value, fileName)
  }

  const handleUploadClick = (subtitle): void => {
    setSubtitle(subtitle)
    setShowUpload(true)
  }

  const handleClose = (): void => {
    setSubtitle(null)
    setShowUpload(false)
  }

  console.log('download progress', isInProgress)

  return (
    <Stack>
      <Typography variant="h4">{t('Subtitles')}</Typography>
      {/* <pre>{JSON.stringify(subtitles, null, 2)}</pre> */}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{t('Edition')}</TableCell>
              <TableCell>{t('Language')}</TableCell>
              <TableCell>{t('Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subtitles.map((subtitle) => (
              <ExpandableRow key={subtitle.id} subtitle={subtitle}>
                <TableCell>{subtitle.edition}</TableCell>
                <TableCell>{subtitle.language.name[0].value}</TableCell>
                {/* <TableCell>
                  <Stack direction="row" gap={0.75}>
                    {isInProgress ? (
                      <Button
                        disabled
                        size="small"
                        variant="outlined"
                        sx={{ width: 'min-content', minWidth: 0, p: '8px' }}
                      >
                        <CircularProgress size="18px" />
                      </Button>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(subtitle)}
                        disabled={isInProgress}
                      >
                        <Download2 />
                      </IconButton>
                    )}

                    <IconButton
                      size="small"
                      onClick={() => handleUploadClick(subtitle)}
                    >
                      <Upload2 />
                    </IconButton>

                    <IconButton size="small">
                      <Trash2 />
                    </IconButton>
                  </Stack>
                </TableCell> */}
              </ExpandableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <DownloadDialog /> */}

      <Dialog
        open={showUpload}
        dialogTitle={{ title: t('Upload Subtitle'), closeButton: true }}
        onClose={handleClose}
        slotProps={{ titleButton: { size: 'small' } }}
        sx={{
          '& .MuiPaper-root': { maxWidth: 400 }
        }}
      >
        {/* <pre>{JSON.stringify(subtitle, null, 2)}</pre> */}
        <FileUpload subtitle={subtitle} />
      </Dialog>
    </Stack>
  )
}
