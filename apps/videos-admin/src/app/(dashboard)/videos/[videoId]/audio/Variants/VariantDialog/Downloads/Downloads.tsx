import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { GetAdminVideoVariant_Downloads as VariantDownloads } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideoVariantDownloadDeleteMutation } from '../../../../../../../../libs/useVideoVariantDownloadDeleteMutation/useVideoVariantDownloadDeleteMutation'

import { bytesToSize } from './utils/bytesToSize'

// Dynamic imports for dialogs
const AddVideoVariantDownloadDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AddVideoVariantDownloadDialog" */
      './AddVideoVariantDownloadDialog'
    ).then((mod) => mod.AddVideoVariantDownloadDialog),
  { ssr: false }
)

const ConfirmDeleteDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ConfirmDeleteDialog" */
      './ConfirmDeleteDialog'
    ).then((mod) => mod.ConfirmDeleteDialog),
  { ssr: false }
)

interface DownloadsProps {
  downloads: VariantDownloads
  videoVariantId: string
  languageId: string
}

export function Downloads({
  downloads,
  videoVariantId,
  languageId
}: DownloadsProps): ReactElement {
  const [deleteVideoVariantDownload] = useVideoVariantDownloadDeleteMutation()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean | null>(
    null
  )
  const [downloadToDelete, setDownloadToDelete] = useState<string | null>(null)

  const existingQualities = downloads.map((download) => download.quality)

  const handleOpenAddDialog = (): void => {
    setIsAddDialogOpen(true)
  }

  const handleCloseAddDialog = (): void => {
    setIsAddDialogOpen(false)
  }

  const handleOpenDeleteDialog = (downloadId: string): void => {
    setDownloadToDelete(downloadId)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = (): void => {
    setIsDeleteDialogOpen(false)
    setDownloadToDelete(null)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (downloadToDelete) {
      await deleteVideoVariantDownload({
        variables: {
          id: downloadToDelete
        }
      })
      handleCloseDeleteDialog()
    }
  }

  const handleAddSuccess = (): void => {
    // Success is handled by the cache update in the mutation hook
  }

  return (
    <>
      <Typography variant="h4">Downloads</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenAddDialog}
        sx={{ my: 2 }}
      >
        Add Download
      </Button>
      <>
        {downloads.length === 0 ? (
          <Typography>No downloads available</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quality</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Dimensions</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {downloads.map(({ id, quality, size, width, height, url }) => (
                  <TableRow key={id}>
                    <TableCell>{quality}</TableCell>
                    <TableCell>{bytesToSize(size)}</TableCell>
                    <TableCell>{`${width}x${height}`}</TableCell>
                    <TableCell>{url}</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="Delete"
                        onClick={() => handleOpenDeleteDialog(id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>

      {isAddDialogOpen != null && (
        <AddVideoVariantDownloadDialog
          open={isAddDialogOpen}
          handleClose={handleCloseAddDialog}
          onSuccess={handleAddSuccess}
          videoVariantId={videoVariantId}
          existingQualities={existingQualities}
          languageId={languageId}
        />
      )}

      {isDeleteDialogOpen != null && (
        <ConfirmDeleteDialog
          open={isDeleteDialogOpen}
          handleClose={handleCloseDeleteDialog}
          handleConfirm={handleDeleteConfirm}
        />
      )}
    </>
  )
}
