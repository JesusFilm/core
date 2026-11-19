import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { type ReactElement, useEffect, useState } from 'react'

interface Journey {
  id: string
  title: string | null
  canEdit?: boolean
}
interface Connection {
  id: string
  clientId: string
  version: number
  mode: 'view' | 'edit'
  expiresAt: string
  journeys: Journey[]
}
interface AccessReview {
  reviewToken: string
  version: number
  mode: 'view' | 'edit'
  journeys: Journey[]
  expiresAt: string
}
interface ConnectionAccessProps {
  connection: Connection
  csrf: string
  disconnect: boolean
  send: <T>(path: string, body: unknown) => Promise<T>
  onClose: () => void
  onComplete: () => Promise<void>
}

export function ConnectionAccess({
  connection,
  csrf,
  disconnect,
  send,
  onClose,
  onComplete
}: ConnectionAccessProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeys, setJourneys] = useState<Journey[]>(connection.journeys)
  const [ids, setIds] = useState(connection.journeys.map((j) => j.id))
  const [mode, setMode] = useState(connection.mode)
  const [review, setReview] = useState<AccessReview>()
  const [busy, setBusy] = useState(!disconnect)
  const [error, setError] = useState(false)
  const binding = {
    csrf,
    expectedVersion: connection.version,
    clientId: connection.clientId
  }
  const path = `/${encodeURIComponent(connection.id)}`

  useEffect(() => {
    if (disconnect) return
    let cancelled = false
    void send<{ journeys: Journey[] }>(`${path}/access-options`, {
      csrf,
      expectedVersion: connection.version,
      clientId: connection.clientId
    })
      .then((result) => {
        if (!cancelled)
          setJourneys([
            ...result.journeys,
            ...connection.journeys.filter(
              (j) => !result.journeys.some((option) => option.id === j.id)
            )
          ])
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
  }, [connection, csrf, disconnect, path, send])

  async function handleReview(): Promise<void> {
    setBusy(true)
    setError(false)
    try {
      setReview(
        await send<AccessReview>(`${path}/access-review`, {
          ...binding,
          journeyIds: ids,
          mode
        })
      )
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  async function handleApprove(): Promise<void> {
    setBusy(true)
    setError(false)
    try {
      await send(
        `${path}/${disconnect ? 'disconnect' : 'access-approve'}`,
        disconnect
          ? binding
          : {
              ...binding,
              expectedVersion: review!.version,
              reviewToken: review!.reviewToken
            }
      )
      await onComplete()
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Stack spacing={2}>
      <Typography variant="h5">
        {disconnect
          ? t('Disconnect connection {{id}}', { id: connection.id })
          : t('Change access for connection {{id}}', { id: connection.id })}
      </Typography>
      <Typography>
        {t('Client: {{clientId}}', { clientId: connection.clientId })}
      </Typography>
      {error && (
        <Alert severity="error">
          {t(
            'Connection details changed or are unavailable. Refresh and review again before approving.'
          )}
        </Alert>
      )}
      {disconnect ? (
        <Alert severity="warning">
          {t(
            'Disconnect stops new work immediately. The change stays Pending until accepted work settles. Reversible history will be discarded. Saved journeys and successful media are kept.'
          )}
        </Alert>
      ) : (
        <>
          <Typography>
            {t(
              'Access changes keep the same connection and expiry. Removed journeys retain eligible history. View only prevents edits, media creation and undo/redo.'
            )}
          </Typography>
          <Typography>
            {t('Expires at {{expiry}}', {
              expiry: review?.expiresAt ?? connection.expiresAt
            })}
          </Typography>
          {review ? (
            <>
              <Typography>
                {review.mode === 'view'
                  ? t('View only')
                  : t('View and edit drafts')}
              </Typography>
              {review.journeys.map((j) => (
                <Typography key={j.id}>{j.title ?? j.id}</Typography>
              ))}
              <Button disabled={busy} onClick={() => setReview(undefined)}>
                {t('Change selection')}
              </Button>
            </>
          ) : (
            <>
              {journeys.map((j) => (
                <FormControlLabel
                  key={j.id}
                  control={
                    <Checkbox
                      checked={ids.includes(j.id)}
                      disabled={busy}
                      onChange={(_event, checked) =>
                        setIds((current) =>
                          checked
                            ? [...current, j.id]
                            : current.filter((id) => id !== j.id)
                        )
                      }
                    />
                  }
                  label={
                    j.title ??
                    t('Journey {{id}} is not currently accessible.', {
                      id: j.id
                    })
                  }
                />
              ))}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={mode === 'view'}
                    disabled={busy}
                    onChange={(_event, checked) =>
                      setMode(checked ? 'view' : 'edit')
                    }
                  />
                }
                label={t('View only')}
              />
              <Button disabled={busy || !ids.length} onClick={handleReview}>
                {t('Review access change')}
              </Button>
            </>
          )}
        </>
      )}
      {(disconnect || review) && (
        <Button
          variant="contained"
          color={disconnect ? 'error' : 'primary'}
          disabled={busy}
          onClick={handleApprove}
        >
          {disconnect ? t('Confirm disconnect') : t('Approve access change')}
        </Button>
      )}
      <Button disabled={busy} onClick={onClose}>
        {t('Cancel')}
      </Button>
    </Stack>
  )
}
