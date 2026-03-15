import DeleteIcon from '@mui/icons-material/Delete'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getAuth, unlink } from 'firebase/auth'
import { ReactElement, useCallback, useState } from 'react'

import { useAuth } from '../../../libs/auth/authContext'
import { logout } from '../../../libs/auth/firebase'

type Status = { type: 'success' | 'error'; message: string } | null

export function DevAuthPanel(): ReactElement {
  const { user: authUser, decodedToken } = useAuth()
  const [status, setStatus] = useState<Status>(null)

  const auth = getAuth()
  const user = auth.currentUser

  const handleDeleteUser = useCallback(async () => {
    if (user == null) return
    try {
      await user.delete()
      setStatus({ type: 'success', message: 'Firebase user deleted' })
      await logout()
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Delete failed: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  }, [user])

  const handleUnlinkProvider = useCallback(
    async (providerId: string) => {
      if (user == null) return
      try {
        await unlink(user, providerId)
        setStatus({
          type: 'success',
          message: `Unlinked ${providerId}`
        })
      } catch (error) {
        setStatus({
          type: 'error',
          message: `Unlink failed: ${error instanceof Error ? error.message : String(error)}`
        })
      }
    },
    [user]
  )

  const handleSignOut = useCallback(async () => {
    await logout()
  }, [])

  if (process.env.NODE_ENV === 'production') return <></>

  return (
    <Box
      sx={{
        mt: 4,
        p: 2,
        border: '2px dashed',
        borderColor: 'warning.main',
        borderRadius: 1
      }}
    >
      <Typography variant="caption" color="warning.main" fontWeight="bold">
        DEV ONLY - Auth Debug
      </Typography>

      {status != null && (
        <Alert
          severity={status.type}
          sx={{ mt: 1 }}
          onClose={() => setStatus(null)}
        >
          {status.message}
        </Alert>
      )}

      {authUser != null && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" fontWeight="bold">
            useAuth() User
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 11 }}
          >
            {JSON.stringify(authUser, null, 2)}
          </Typography>
        </Box>
      )}

      {decodedToken != null && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" fontWeight="bold">
            SSR Decoded Token
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 11 }}
          >
            {JSON.stringify(decodedToken, null, 2)}
          </Typography>
        </Box>
      )}

      {user != null ? (
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography variant="caption" fontWeight="bold">
            Firebase currentUser
          </Typography>
          <Typography variant="body2">
            UID: {user.uid}
          </Typography>
          <Typography variant="body2">
            Email: {user.email ?? 'none'}
          </Typography>
          <Typography variant="body2">
            Anonymous: {String(user.isAnonymous)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {user.providerData.map((provider) => (
              <Chip
                key={provider.providerId}
                label={provider.providerId}
                size="small"
                onDelete={() => handleUnlinkProvider(provider.providerId)}
                deleteIcon={<LinkOffIcon />}
              />
            ))}
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteUser}
            >
              Delete Firebase User
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSignOut}
            >
              Sign Out Only
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ mt: 1 }}>
          No Firebase user signed in
        </Typography>
      )}
    </Box>
  )
}
