'use client'

import { gql, useMutation } from '@apollo/client'
import CloudSyncIcon from '@mui/icons-material/CloudSync'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

export const WESS_IMPORT = gql`
  mutation WessImport {
    wessImport {
      success
      languagesImported
      countriesImported
      countryLanguagesImported
      message
    }
  }
`

interface WessImportData {
  wessImport: {
    success: boolean
    languagesImported: number
    countriesImported: number
    countryLanguagesImported: number
    message: string
  }
}

export function WessImportButton(): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [runImport, { loading }] = useMutation<WessImportData>(WESS_IMPORT, {
    onCompleted: (data) => {
      enqueueSnackbar(data.wessImport.message, { variant: 'success' })
    },
    onError: (error) => {
      enqueueSnackbar(`WESS import failed: ${error.message}`, {
        variant: 'error'
      })
    }
  })

  function handleOpenConfirm(): void {
    setConfirmOpen(true)
  }

  function handleCloseConfirm(): void {
    setConfirmOpen(false)
  }

  async function handleConfirmImport(): Promise<void> {
    setConfirmOpen(false)
    try {
      await runImport()
    } catch {
      // Errors are surfaced via the mutation's onError handler.
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <CloudSyncIcon />
          )
        }
        onClick={handleOpenConfirm}
        disabled={loading}
        aria-label="Run WESS import"
        sx={{ ml: { sm: 'auto' }, whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {loading ? 'Importing…' : 'Run WESS import'}
      </Button>
      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        aria-labelledby="wess-import-dialog-title"
        aria-describedby="wess-import-dialog-description"
      >
        <DialogTitle id="wess-import-dialog-title">
          Run WESS import?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="wess-import-dialog-description">
            This imports languages, countries, and country-languages from WESS
            in order. It runs synchronously and can take several minutes — keep
            this tab open until it finishes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={handleConfirmImport} variant="contained" autoFocus>
            Run import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
