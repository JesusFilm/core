import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { useAuth } from '../../libs/auth'
import { getFirebaseAuth } from '../../libs/auth/firebase'

import { ConnectionAccess } from './ConnectionAccess/ConnectionAccess'

interface Connection {
  id: string
  clientId: string
  mode: 'view' | 'edit'
  status: 'active' | 'expired' | 'pending' | 'disconnected'
  version: number
  change?: { id: string; kind: string; status: 'pending' | 'complete' } | null
  credentialsPending?: boolean
  expiresAt: string
  journeys: Array<{ id: string; title: string | null }>
}
interface ConnectionPage {
  csrf: string
  connections: Connection[]
  nextCursor: string | null
}
interface RenewalReview {
  reviewToken: string
  duration: string
  previewExpiresAt: string
  previousExpiresAt: string
  version: number
}

export function ConnectedAgents({ issuer }: { issuer: string }): ReactElement {
  const { user } = useAuth()
  const userId = user?.id
  const { t } = useTranslation('apps-journeys-admin')
  const [page, setPage] = useState<ConnectionPage>()
  const [owner, setOwner] = useState<string>()
  const [selected, setSelected] = useState<Connection>()
  const [action, setAction] = useState<'renew' | 'access' | 'disconnect'>(
    'renew'
  )
  const [duration, setDuration] = useState('week')
  const [review, setReview] = useState<RenewalReview>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [renewedExpiry, setRenewedExpiry] = useState<string>()
  const send = useCallback(
    async <T,>(path: string, body: unknown): Promise<T> => {
      const auth = getFirebaseAuth()
      await auth.authStateReady()
      if (!userId || auth.currentUser?.uid !== userId)
        throw new Error('Sign in required')
      const token = await auth.currentUser.getIdToken()
      const response = await fetch(`${issuer}/connections${path}`, {
        method: 'POST',
        credentials: 'include',
        redirect: 'error',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      if (!response.ok) throw new Error('Review current connection')
      const result = (await response.json()) as T
      if (auth.currentUser?.uid !== userId) throw new Error('Session changed')
      return result
    },
    [issuer, userId]
  )

  useEffect(() => {
    let cancelled = false
    setPage(undefined)
    setSelected(undefined)
    setReview(undefined)
    setRenewedExpiry(undefined)
    setError(false)
    if (!userId) return
    setBusy(true)
    void send<ConnectionPage>('', {})
      .then((result) => {
        if (!cancelled) {
          setPage(result)
          setOwner(userId)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [send, userId])

  async function handleRefresh(after?: string): Promise<void> {
    setBusy(true)
    setError(false)
    setSelected(undefined)
    setReview(undefined)
    try {
      const result = await send<ConnectionPage>('', after ? { after } : {})
      setPage((current) => ({
        ...result,
        connections: after
          ? [...(current?.connections ?? []), ...result.connections]
          : result.connections
      }))
      setOwner(userId)
    } catch {
      setError(true)
      setPage(undefined)
    } finally {
      setBusy(false)
    }
  }
  async function handleReview(): Promise<void> {
    if (!selected || !page) return
    setBusy(true)
    setError(false)
    try {
      setReview(
        await send<RenewalReview>(
          `/${encodeURIComponent(selected.id)}/review`,
          {
            csrf: page.csrf,
            expectedVersion: selected.version,
            clientId: selected.clientId,
            duration
          }
        )
      )
    } catch {
      setError(true)
      setReview(undefined)
    } finally {
      setBusy(false)
    }
  }
  async function handleApprove(): Promise<void> {
    if (!selected || !review || !page) return
    setBusy(true)
    setError(false)
    try {
      const result = await send<{ expiresAt: string }>(
        `/${encodeURIComponent(selected.id)}/approve`,
        {
          csrf: page.csrf,
          expectedVersion: review.version,
          clientId: selected.clientId,
          reviewToken: review.reviewToken
        }
      )
      setRenewedExpiry(result.expiresAt)
      await handleRefresh()
    } catch {
      setError(true)
      setReview(undefined)
    } finally {
      setBusy(false)
    }
  }

  const statuses = {
    active: t('Active'),
    expired: t('Expired'),
    pending: t('Change pending'),
    disconnected: t('Disconnected')
  }
  return (
    <Stack spacing={3} sx={{ maxWidth: 800 }}>
      <Typography variant="h4">{t('Connected agents')}</Typography>
      <Typography>
        {t(
          'These connections belong to your account. Existing Admin permissions always apply.'
        )}
      </Typography>
      {error && (
        <Alert severity="error">
          {t(
            'Connection details changed or are unavailable. Refresh and review again before approving.'
          )}
        </Alert>
      )}
      {renewedExpiry && (
        <Alert severity="success">
          {t(
            'Connection renewed until {{expiry}}. Reconnect from your agent and choose this renewed connection to get new credentials.',
            { expiry: renewedExpiry }
          )}
        </Alert>
      )}
      <Button disabled={busy} onClick={() => handleRefresh()}>
        {t('Refresh connections')}
      </Button>
      {page && owner === userId && (
        <>
          {page.connections.length === 0 && (
            <Typography>{t('You have no connected agents.')}</Typography>
          )}
          {page.connections.map((connection) => (
            <Card key={connection.id} variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Typography sx={{ overflowWrap: 'anywhere' }}>
                    {t('Client: {{clientId}}', {
                      clientId: connection.clientId
                    })}
                  </Typography>
                  <Typography>
                    {t('Connection: {{id}}', { id: connection.id })}
                  </Typography>
                  <Typography>
                    {connection.mode === 'view'
                      ? t('View only')
                      : t('View and edit drafts')}
                  </Typography>
                  <Typography>{statuses[connection.status]}</Typography>
                  {connection.change && (
                    <Typography>
                      {connection.change.status === 'pending'
                        ? t(
                            'Pending: new work is blocked while accepted operations settle. Refresh to check completion.'
                          )
                        : t('Change complete')}
                    </Typography>
                  )}
                  {(['access', 'disconnect'] as const).map((nextAction) => (
                    <Button
                      key={nextAction}
                      disabled={
                        busy ||
                        connection.status === 'pending' ||
                        connection.status === 'disconnected'
                      }
                      onClick={() => {
                        setSelected(connection)
                        setAction(nextAction)
                        setReview(undefined)
                      }}
                    >
                      {nextAction === 'access'
                        ? t('Change access for connection {{id}}', {
                            id: connection.id
                          })
                        : t('Disconnect connection {{id}}', {
                            id: connection.id
                          })}
                    </Button>
                  ))}
                  {connection.credentialsPending && (
                    <Typography>
                      {t(
                        'Reconnect from your agent to get new credentials for this connection.'
                      )}
                    </Typography>
                  )}
                  <Typography>
                    {t('Expires at {{expiry}}', {
                      expiry: connection.expiresAt
                    })}
                  </Typography>
                  {connection.journeys.map((journey) => (
                    <Typography key={journey.id}>
                      {journey.title ??
                        t('Journey {{id}} is not currently accessible.', {
                          id: journey.id
                        })}
                    </Typography>
                  ))}
                  <Button
                    disabled={
                      busy ||
                      connection.status === 'pending' ||
                      connection.status === 'disconnected'
                    }
                    onClick={() => {
                      setSelected(connection)
                      setAction('renew')
                      setReview(undefined)
                      setDuration('week')
                      setRenewedExpiry(undefined)
                    }}
                  >
                    {t('Renew connection {{id}}', { id: connection.id })}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {page.nextCursor && (
            <Button
              disabled={busy}
              onClick={() => handleRefresh(page.nextCursor!)}
            >
              {t('Load more connections')}
            </Button>
          )}
          {selected && action !== 'renew' && (
            <ConnectionAccess
              key={selected.id + page.csrf + action}
              connection={selected}
              csrf={page.csrf}
              disconnect={action === 'disconnect'}
              send={send}
              onClose={() => setSelected(undefined)}
              onComplete={() => handleRefresh()}
            />
          )}
          {selected && action === 'renew' && (
            <Stack spacing={2}>
              <Typography variant="h5">
                {t('Renew connection {{id}}', { id: selected.id })}
              </Typography>
              <Typography>
                {t(
                  'Renewal keeps the selected journeys and access. It does not reset usage or retention, restore disconnected access or start unfinished jobs.'
                )}
              </Typography>
              {!review ? (
                <>
                  <FormControl>
                    <InputLabel id="renewal-duration">
                      {t('Connection duration')}
                    </InputLabel>
                    <Select
                      labelId="renewal-duration"
                      label={t('Connection duration')}
                      value={duration}
                      disabled={busy}
                      onChange={(event) => setDuration(event.target.value)}
                    >
                      <MenuItem value="day">{t('One day')}</MenuItem>
                      <MenuItem value="week">{t('One week')}</MenuItem>
                      <MenuItem value="month">{t('One month')}</MenuItem>
                      <MenuItem value="year">{t('One year')}</MenuItem>
                    </Select>
                  </FormControl>
                  <Button disabled={busy} onClick={handleReview}>
                    {t('Review renewal')}
                  </Button>
                </>
              ) : (
                <>
                  <Typography>
                    {t(
                      'If approved now, access expires at {{expiry}}. The chosen duration starts when the server accepts your approval.',
                      { expiry: review.previewExpiresAt }
                    )}
                  </Typography>
                  {review.previewExpiresAt < review.previousExpiresAt && (
                    <Alert severity="warning">
                      {t(
                        'This duration shortens the current connection lifetime.'
                      )}
                    </Alert>
                  )}
                  <Typography>
                    {t(
                      'Approval retires the old credentials. Using or refreshing a connection never renews consent.'
                    )}
                  </Typography>
                  <Button
                    variant="contained"
                    disabled={busy}
                    onClick={handleApprove}
                  >
                    {t('Approve renewal')}
                  </Button>
                  <Button disabled={busy} onClick={() => setReview(undefined)}>
                    {t('Change duration')}
                  </Button>
                </>
              )}
              <Button
                disabled={busy}
                onClick={() => {
                  setSelected(undefined)
                  setReview(undefined)
                }}
              >
                {t('Cancel')}
              </Button>
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
