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
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import { GetAdminVideoVariant_Downloads as VariantDownloads } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideoVariantDownloadDeleteMutation } from '../../../../../../../../../libs/useVideoVariantDownloadDeleteMutation/useVideoVariantDownloadDeleteMutation'

import { AddVideoVariantDownloadDialog } from './AddVideoVariantDownloadDialog'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { bytesToSize } from './utils/bytesToSize'

interface DownloadsProps {
  downloads: VariantDownloads
  videoVariantId: string
}

export function Downloads({
  downloads,
  videoVariantId
}: DownloadsProps): ReactElement {
  const t = useTranslations()
  const [deleteVideoVariantDownload] = useVideoVariantDownloadDeleteMutation()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
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
      try {
        await deleteVideoVariantDownload({
          variables: {
            id: downloadToDelete
          }
        })
        handleCloseDeleteDialog()
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  }

  const handleAddSuccess = (): void => {
    // Success is handled by the cache update in the mutation hook
  }

  return (
    <>
      <Typography variant="h4">{t('Downloads')}</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenAddDialog}
        sx={{ my: 2 }}
      >
        {t('Add Download')}
      </Button>
      <>
        {downloads.length === 0 ? (
          <Typography>{t('No downloads available')}</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Quality')}</TableCell>
                  <TableCell>{t('Size')}</TableCell>
                  <TableCell>{t('Dimensions')}</TableCell>
                  <TableCell>{t('URL')}</TableCell>
                  <TableCell>{t('Actions')}</TableCell>
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
                        aria-label={t('Delete')}
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

      <AddVideoVariantDownloadDialog
        open={isAddDialogOpen}
        handleClose={handleCloseAddDialog}
        onSuccess={handleAddSuccess}
        videoVariantId={videoVariantId}
        existingQualities={existingQualities}
      />

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        handleClose={handleCloseDeleteDialog}
        handleConfirm={handleDeleteConfirm}
      />
    </>
  )
}
