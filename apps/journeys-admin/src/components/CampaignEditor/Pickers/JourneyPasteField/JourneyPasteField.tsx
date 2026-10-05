import { CombinedGraphQLErrors } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useState
} from 'react'

import { GetCampaignJourneyByLink_journey as ResolvedJourney } from '../../../../../__generated__/GetCampaignJourneyByLink'
import { IdType } from '../../../../../__generated__/globalTypes'
import { useCampaignJourneyByLinkLazyQuery } from '../../../../libs/useCampaignJourneyByLinkLazyQuery'

/** How a pasted journey link addresses the journey: an admin link by id, a public URL by slug. */
export type JourneyLink = { id: string } | { slug: string }

/**
 * The client-side shape check of a pasted journey link, mirroring the API's
 * parser: an http(s) URL whose path is `/journeys/<id>` (admin link),
 * `/embed/<slug>` or `/<slug>` on any domain. Null when it is none of those;
 * whether the journey exists and is published is the server's call.
 */
export function parseJourneyLink(value: string): JourneyLink | null {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const [first, second] = url.pathname
    .split('/')
    .filter((segment) => segment !== '')
  if (first == null) return null
  if (first === 'journeys' && second != null) return { id: second }
  if (first === 'embed' && second != null) return { slug: second }
  return { slug: first }
}

function messageOf(error: unknown, fallback: string): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  return error instanceof Error ? error.message : fallback
}

interface JourneyPasteFieldProps {
  /** Keep the resolved journey: runs the link mutation; a thrown error's message is shown verbatim. */
  onLink: (url: string) => Promise<void>
  /** Shown when nothing has been pasted yet. */
  label?: string
  autoFocus?: boolean
  disabled?: boolean
}

/**
 * The journey paste field: an admin link or a public URL on any domain.
 * The shape is checked client-side; the journey is resolved through the
 * public journey query (routing filter skipped, published only, any team)
 * and shown before it is kept; the server re-resolves on link and its
 * message, on failure, is shown verbatim under the field (PRD §5, §15).
 */
export function JourneyPasteField({
  onLink,
  label,
  autoFocus = false,
  disabled = false
}: JourneyPasteFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()
  const [resolved, setResolved] = useState<ResolvedJourney>()
  const [resolvedFor, setResolvedFor] = useState<string>()
  const [linking, setLinking] = useState(false)
  const [resolve, { loading: resolving }] = useCampaignJourneyByLinkLazyQuery()

  async function handleResolve(raw: string): Promise<void> {
    const trimmed = raw.trim()
    if (trimmed === '' || trimmed === resolvedFor) return
    setResolved(undefined)
    setResolvedFor(undefined)
    const link = parseJourneyLink(trimmed)
    if (link == null) {
      setError(t('Paste a journey link: its admin link or its public address.'))
      return
    }
    setError(undefined)
    try {
      const { data, error: queryError } = await resolve({
        variables:
          'id' in link
            ? { id: link.id, idType: IdType.databaseId }
            : { id: link.slug, idType: IdType.slug }
      })
      if (queryError != null) {
        setError(messageOf(queryError, t('Journey not found or not published')))
        return
      }
      if (data?.journey == null)
        throw new Error(t('Journey not found or not published'))
      setResolved(data.journey)
      setResolvedFor(trimmed)
    } catch (resolveError) {
      setError(messageOf(resolveError, t('Journey not found or not published')))
    }
  }

  async function handleLink(
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    event.stopPropagation()
    if (resolvedFor == null) return
    setLinking(true)
    try {
      await onLink(resolvedFor)
      setValue('')
      setResolved(undefined)
      setResolvedFor(undefined)
      setError(undefined)
    } catch (linkError) {
      setError(messageOf(linkError, t('Could not link journey')))
    } finally {
      setLinking(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Enter') return
    event.preventDefault()
    void handleResolve(value)
  }

  return (
    <Stack
      spacing={1}
      data-testid="JourneyPasteField"
      onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      sx={{ width: '100%' }}
    >
      <TextField
        label={label ?? t('Journey link')}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          if (error != null) setError(undefined)
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          void handleResolve(event.target.value)
        }}
        onKeyDown={handleKeyDown}
        error={error != null}
        helperText={
          error ?? t('Paste the journey’s admin link or its public address.')
        }
        autoFocus={autoFocus}
        disabled={disabled || linking}
        fullWidth
        size="small"
        slotProps={{
          htmlInput: {
            'aria-label': label ?? t('Journey link'),
            inputMode: 'url'
          }
        }}
      />
      {resolving && (
        <Typography variant="caption" color="text.secondary">
          {t('Looking up journey…')}
        </Typography>
      )}
      {resolved != null && (
        <Stack
          direction="row"
          spacing={2}
          data-testid="JourneyPasteResolved"
          sx={{ alignItems: 'center' }}
        >
          <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
            {resolved.title}
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              /{resolved.slug}
            </Typography>
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={(event) => {
              void handleLink(event)
            }}
            disabled={linking}
            data-testid="JourneyPasteLink"
          >
            {t('Use this journey')}
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
