import DownloadDoneIcon from '@mui/icons-material/DownloadDone'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload'
import ErrorIcon from '@mui/icons-material/Error'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import SyncIcon from '@mui/icons-material/Sync'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { ReactElement, useState } from 'react'

import { useBackgroundUpload } from '../../../BackgroundUpload'
import {
  UploadQueueItem,
  UploadStatus
} from '../../../BackgroundUpload/BackgroundUploadContext'

export function BackgroundUploadItem({
  upload
}: {
  upload: UploadQueueItem
}): ReactElement {
  return (
    <>
      <Tooltip title={UploadStatus[upload.status]}>
        <MenuItem>
          <ListItemAvatar>
            {
              [
                <FileUploadIcon key={`upload-status-${upload.id}`} />,
                <SyncIcon key={`upload-status-${upload.id}`} />,
                <ErrorIcon key={`upload-status-${upload.id}`} />,
                <DownloadDoneIcon key={`upload-status-${upload.id}`} />
              ][upload.status]
            }
          </ListItemAvatar>
          <ListItemText
            primary={upload.fileName}
            secondary={UploadStatus[upload.status]}
          />
        </MenuItem>
      </Tooltip>
      {[UploadStatus.processing, UploadStatus.uploading].includes(
        upload.status
      ) && (
        <MenuItem>
          <LinearProgress
            variant={
              upload.status === UploadStatus.processing
                ? 'indeterminate'
                : 'determinate'
            }
            value={upload.progress}
            // value={100}
            sx={{
              height: 32,
              width: '100%',
              borderRadius: 2,
              mx: 2,
              my: 1
            }}
          />
        </MenuItem>
      )}
    </>
  )
}
export function BackgroundUploadsItem(): ReactElement {
  const { uploadQueue, activeUploads, uploadMenuOpen, setUploadMenuOpen } =
    useBackgroundUpload()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
    setUploadMenuOpen(true)
  }

  const handleCloseMenu = (): void => {
    setAnchorEl(null)
    setUploadMenuOpen(false)
  }
  return (
    <>
      <Badge badgeContent={activeUploads()} color="secondary">
        <IconButton
          color="inherit"
          onClick={handleShowMenu}
          disabled={Object.keys(uploadQueue).length === 0}
        >
          <DriveFolderUploadIcon />
        </IconButton>
      </Badge>
      <Menu
        id="edit-journey-uploads"
        anchorEl={anchorEl}
        open={uploadMenuOpen}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'edit-journey-uploads'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        data-testid="BackgroundUploadMenu"
      >
        {Object.keys(uploadQueue).map((key) => (
          <BackgroundUploadItem
            upload={uploadQueue[key]}
            key={`upload-background-video-${key}`}
          />
        ))}
      </Menu>
    </>
  )
}
