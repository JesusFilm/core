import DownloadDoneIcon from '@mui/icons-material/DownloadDone'
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload'
import ErrorIcon from '@mui/icons-material/Error'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import SyncIcon from '@mui/icons-material/Sync'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { ReactElement, useState } from 'react'

import { useBackgroundUpload } from '../../../BackgroundUpload'
import { UploadStatus } from '../../../BackgroundUpload/BackgroundUploadContext'

export function BackgroundUploadsItem(): ReactElement {
  const { uploadQueue, activeUploads } = useBackgroundUpload()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = (): void => {
    setAnchorEl(null)
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
        open={Boolean(anchorEl)}
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
        {Object.keys(uploadQueue).map((key) => {
          const upload = uploadQueue[key]
          return (
            <Tooltip
              title={UploadStatus[upload.status]}
              key={`upload-background-video-${upload.id}`}
            >
              <MenuItem>
                <ListItemText>{upload.fileName}</ListItemText>
                <ListItemIcon>
                  {
                    [
                      <FileUploadIcon key={`upload-status-${upload.id}`} />,
                      <SyncIcon key={`upload-status-${upload.id}`} />,
                      <ErrorIcon key={`upload-status-${upload.id}`} />,
                      <DownloadDoneIcon key={`upload-status-${upload.id}`} />
                    ][upload.status]
                  }
                </ListItemIcon>
              </MenuItem>
            </Tooltip>
          )
        })}
      </Menu>
    </>
  )
}
