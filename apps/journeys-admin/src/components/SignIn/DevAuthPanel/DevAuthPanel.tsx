import DeleteIcon from '@mui/icons-material/Delete'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getAuth, unlink } from 'firebase/auth'
import { ReactElement, useCallback, useState } from 'react'

import { useAuth } from '../../../libs/auth/authContext'
import { logout } from '../../../libs/auth/firebase'

type Status = { type: 'success' | 'error'; message: string } | null

interface LookedUpUser {
  uid: string
  email?: string
  displayName?: string
  emailVerified: boolean
  disabled: boolean
  providers: Array<{ providerId: string; email?: string; displayName?: string }>
}

async function adminAction(
  body: Record<string, string>
): Promise<{ success?: boolean; error?: string; [key: string]: unknown }> {
  const res = await fetch('/api/dev-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return await res.json()
}

export function DevAuthPanel(): ReactElement {
  const { user: authUser, decodedToken } = useAuth()
  const [status, setStatus] = useState<Status>(null)
  const [lookupUid, setLookupUid] = useState('')
  const [lookedUpUser, setLookedUpUser] = useState<LookedUpUser | null>(null)

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

  const handleLookup = useCallback(async () => {
    if (lookupUid.trim() === '') return
    const result = await adminAction({ action: 'get', uid: lookupUid.trim() })
    if (result.error != null) {
      setStatus({ type: 'error', message: String(result.error) })
      setLookedUpUser(null)
    } else {
      setLookedUpUser(result as unknown as LookedUpUser)
      setStatus(null)
    }
  }, [lookupUid])

  const handleAdminUnlink = useCallback(
    async (providerId: string) => {
      if (lookedUpUser == null) return
      const result = await adminAction({
        action: 'unlink',
        uid: lookedUpUser.uid,
        providerId
      })
      if (result.error != null) {
        setStatus({ type: 'error', message: String(result.error) })
      } else {
        setStatus({
          type: 'success',
          message: String(result.message)
        })
        // refresh the looked up user
        const refreshed = await adminAction({
          action: 'get',
          uid: lookedUpUser.uid
        })
        if (refreshed.error == null)
          setLookedUpUser(refreshed as unknown as LookedUpUser)
      }
    },
    [lookedUpUser]
  )

  const handleAdminDelete = useCallback(async () => {
    if (lookedUpUser == null) return
    const result = await adminAction({
      action: 'delete',
      uid: lookedUpUser.uid
    })
    if (result.error != null) {
      setStatus({ type: 'error', message: String(result.error) })
    } else {
      setStatus({ type: 'success', message: String(result.message) })
      setLookedUpUser(null)
    }
  }, [lookedUpUser])

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

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" fontWeight="bold">
        Admin: Manage Any User by UID
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Enter Firebase UID"
          value={lookupUid}
          onChange={(e) => setLookupUid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleLookup()
          }}
          fullWidth
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<SearchIcon />}
          onClick={handleLookup}
        >
          Lookup
        </Button>
      </Stack>

      {lookedUpUser != null && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2">
            UID: {lookedUpUser.uid}
          </Typography>
          <Typography variant="body2">
            Email: {lookedUpUser.email ?? 'none'}
          </Typography>
          <Typography variant="body2">
            Name: {lookedUpUser.displayName ?? 'none'}
          </Typography>
          <Typography variant="body2">
            Verified: {String(lookedUpUser.emailVerified)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {lookedUpUser.providers.map((provider) => (
              <Chip
                key={provider.providerId}
                label={`${provider.providerId} (${provider.email ?? 'no email'})`}
                size="small"
                onDelete={() => handleAdminUnlink(provider.providerId)}
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
              onClick={handleAdminDelete}
            >
              Delete This User
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  )
}
