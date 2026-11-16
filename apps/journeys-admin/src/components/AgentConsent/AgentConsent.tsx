import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { useAuth } from '../../libs/auth'
import { getFirebaseAuth } from '../../libs/auth/firebase'

interface ConsentDetails {
  clientName: string
  clientId: string
  redirectUri: string
  csrf: string
  journeys: Array<{ id: string; title: string; canEdit: boolean }>
}
interface ConsentReview {
  reviewToken: string
  expiresAt: string
  mode: 'view' | 'edit'
  duration: string
  journeyIds: string[]
}
export interface AgentConsentProps {
  issuer: string
  interaction: string
}

export function AgentConsent({
  issuer,
  interaction
}: AgentConsentProps): ReactElement {
  const { user } = useAuth()
  const { t } = useTranslation('apps-journeys-admin')
  const [details, setDetails] = useState<ConsentDetails>()
  const [selected, setSelected] = useState<string[]>([])
  const [mode, setMode] = useState<'view' | 'edit'>('edit')
  const [duration, setDuration] = useState('week')
  const [review, setReview] = useState<ConsentReview>()
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function send<T>(step: string, body: unknown): Promise<T> {
    const auth = getFirebaseAuth()
    await auth.authStateReady()
    if (auth.currentUser?.uid !== user?.id) throw new Error('Sign in required')
    const token = await auth.currentUser?.getIdToken()
    if (!token) throw new Error('Sign in required')
    const response = await fetch(
      `${issuer}/interaction/${encodeURIComponent(interaction)}/${step}`,
      {
        method: 'POST',
        credentials: 'include',
        redirect: 'error',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )
    if (!response.ok) throw new Error('Review connection again')
    return response.json() as Promise<T>
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setBusy(true)
    void send<ConsentDetails>('details', {})
      .then((result) => {
        if (!cancelled) {
          setDetails(result)
          setReview(undefined)
          setSelected([])
          setError(false)
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
    // Rebind on identity/interaction changes. Token refresh must not reset consent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issuer, interaction, user?.id])

  async function handleReview(): Promise<void> {
    if (!details) return
    setBusy(true)
    setError(false)
    try {
      setReview(
        await send<ConsentReview>('review', {
          csrf: details.csrf,
          journeyIds: selected,
          mode,
          duration
        })
      )
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  async function handleDecision(decision: 'approve' | 'deny'): Promise<void> {
    if (!details || (decision === 'approve' && !review)) return
    setBusy(true)
    setError(false)
    try {
      const result = await send<{ redirectUrl: string }>('decision', {
        csrf: details.csrf,
        reviewToken: review?.reviewToken,
        decision
      })
      const redirect = new URL(result.redirectUrl)
      if (redirect.origin !== issuer) throw new Error('Invalid issuer')
      window.location.assign(redirect.href)
    } catch {
      setError(true)
      setReview(undefined)
      setBusy(false)
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Typography variant="h4">{t('Connect an agent')}</Typography>
      {error && (
        <Alert severity="error">
          {t(
            'The connection could not be approved. Review your selection again or restart from your agent.'
          )}
        </Alert>
      )}
      {details && (
        <>
          <Typography>
            {t('{{client}} wants access to your selected journeys.', {
              client: details.clientName
            })}
          </Typography>
          <Typography sx={{ overflowWrap: 'anywhere' }}>
            {t('Client: {{clientId}}', { clientId: details.clientId })}
          </Typography>
          <Typography sx={{ overflowWrap: 'anywhere' }}>
            {t('Return address: {{redirectUri}}', {
              redirectUri: details.redirectUri
            })}
          </Typography>
          <Typography>
            {t(
              'Existing Admin permissions always apply. Editing is limited to ordinary drafts. Publishing, Hosts and creating journeys are excluded.'
            )}
          </Typography>
          {!review ? (
            <>
              <FormControl>
                <FormLabel id="agent-access-mode">{t('Access')}</FormLabel>
                <RadioGroup
                  aria-labelledby="agent-access-mode"
                  value={mode}
                  onChange={(event) => {
                    setMode(event.target.value as 'view' | 'edit')
                    setSelected([])
                  }}
                >
                  <FormControlLabel
                    value="view"
                    control={<Radio />}
                    label={t('View only')}
                  />
                  <FormControlLabel
                    value="edit"
                    control={<Radio />}
                    label={t('View and edit drafts')}
                  />
                </RadioGroup>
              </FormControl>
              <Typography>
                {mode === 'view'
                  ? t(
                      'Read and preview selected journeys. No changes, uploads, image generation, attachment or undo/redo.'
                    )
                  : t(
                      'Read and preview selected journeys, edit draft content, upload or generate media on request, attach media and undo/redo eligible agent edits.'
                    )}
              </Typography>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t('Select journeys')}</FormLabel>
                <FormGroup>
                  {details.journeys.map((journey) => (
                    <FormControlLabel
                      key={journey.id}
                      control={
                        <Checkbox
                          checked={selected.includes(journey.id)}
                          disabled={mode === 'edit' && !journey.canEdit}
                          onChange={(_event, checked) =>
                            setSelected((current) =>
                              checked
                                ? [...current, journey.id]
                                : current.filter((id) => id !== journey.id)
                            )
                          }
                        />
                      }
                      label={journey.title}
                    />
                  ))}
                </FormGroup>
              </FormControl>
              {details.journeys.length === 0 && (
                <Typography>
                  {t('No eligible journeys are available for this account.')}
                </Typography>
              )}
              <FormControl>
                <FormLabel id="agent-consent-duration">
                  {t('Connection duration')}
                </FormLabel>
                <Select
                  aria-labelledby="agent-consent-duration"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <MenuItem value="day">{t('One day')}</MenuItem>
                  <MenuItem value="week">{t('One week')}</MenuItem>
                  <MenuItem value="month">{t('One month')}</MenuItem>
                  <MenuItem value="year">{t('One year')}</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                disabled={busy || selected.length === 0}
                onClick={handleReview}
              >
                {t('Review connection')}
              </Button>
              <Button disabled={busy} onClick={() => handleDecision('deny')}>
                {t('Deny connection')}
              </Button>
            </>
          ) : (
            <>
              <Typography>
                {review.mode === 'view'
                  ? t('View only')
                  : t('View and edit drafts')}
              </Typography>
              {review.journeyIds.map((id) => (
                <Typography key={id}>
                  {details.journeys.find((journey) => journey.id === id)?.title}
                </Typography>
              ))}
              <Typography>
                {t(
                  'Access expires at {{expiry}}. Using or refreshing the connection will not extend this time.',
                  { expiry: new Date(review.expiresAt).toISOString() }
                )}
              </Typography>
              <Typography>
                {t(
                  'Review this deadline and approve within one minute. If the review expires, review your selection again.'
                )}
              </Typography>
              <Button
                variant="contained"
                disabled={busy}
                onClick={() => handleDecision('approve')}
              >
                {t('Approve connection')}
              </Button>
              <Button disabled={busy} onClick={() => handleDecision('deny')}>
                {t('Deny connection')}
              </Button>
              <Button disabled={busy} onClick={() => setReview(undefined)}>
                {t('Change selection')}
              </Button>
            </>
          )}
        </>
      )}
    </Stack>
  )
}
