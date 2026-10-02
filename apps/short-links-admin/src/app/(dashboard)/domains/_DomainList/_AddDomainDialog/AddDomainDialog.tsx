'use client'

import { useMutation } from '@apollo/client/react'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { TextField } from '../../../../../components/form'
import {
  GET_SHORT_LINK_DOMAINS,
  SHORT_LINK_DOMAIN_FIELDS,
  isMutationError,
  parseMutationError
} from '../../../../../libs/shortLink'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle
} from '@/components/ui/dialog'

export const SHORT_LINK_DOMAIN_CREATE = graphql(
  `
    mutation ShortLinkDomainCreate(
      $input: MutationShortLinkDomainCreateInput!
    ) {
      shortLinkDomainCreate(input: $input) {
        __typename
        ... on MutationShortLinkDomainCreateSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on ZodError {
          message
          fieldErrors {
            message
            path
          }
        }
        ... on NotUniqueError {
          message
          location {
            path
            value
          }
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/
const PATH_PREFIX_PATTERN = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/

interface AddDomainDialogProps {
  open: boolean
  onClose: () => void
  /** called with the new domain's id once it exists */
  onCreated: (id: string) => void
}

/**
 * superAdmin only. Adds the domain record in core; the hostname is not
 * registered anywhere yet. Its Cloudflare setup is done on the domain page.
 */
export function AddDomainDialog({
  open,
  onClose,
  onCreated
}: AddDomainDialogProps): ReactElement {
  const [hostname, setHostname] = useState('')
  const [pathPrefix, setPathPrefix] = useState('s')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string>()
  const [create, { loading }] = useMutation(SHORT_LINK_DOMAIN_CREATE, {
    refetchQueries: [GET_SHORT_LINK_DOMAINS]
  })

  function handleClose(): void {
    setHostname('')
    setPathPrefix('s')
    setErrors({})
    setErrorMessage(undefined)
    onClose()
  }

  async function handleSubmit(): Promise<void> {
    const trimmedHostname = hostname.trim().toLowerCase()
    const trimmedPrefix = pathPrefix.trim()
    const nextErrors: Record<string, string> = {}
    if (!HOSTNAME_PATTERN.test(trimmedHostname))
      nextErrors.hostname = 'Enter a hostname such as jesus.film'
    if (trimmedPrefix !== '' && !PATH_PREFIX_PATTERN.test(trimmedPrefix))
      nextErrors.pathPrefix =
        'Letters, numbers, _ and - only, with no leading or trailing slash'
    setErrors(nextErrors)
    setErrorMessage(undefined)
    if (Object.keys(nextErrors).length > 0) return

    try {
      const { data } = await create({
        variables: {
          input: {
            hostname: trimmedHostname,
            pathPrefix: trimmedPrefix,
            // served by the redirect Worker, never the legacy Vercel app
            vercel: false
          }
        }
      })
      const outcome = data?.shortLinkDomainCreate
      if (outcome == null) {
        setErrorMessage('No response from the server')
        return
      }
      if (isMutationError(outcome)) {
        const parsed = parseMutationError(outcome)
        setErrorMessage(parsed.message)
        setErrors(parsed.fieldErrors)
        return
      }
      const { id } = outcome.data
      handleClose()
      onCreated(id)
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : 'Could not add the domain'
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose()
      }}
    >
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add domain</DialogTitle>
          <DialogDescription>
            Adds the domain to core. Nothing changes in Cloudflare until you set
            up its KV and attach it on the domain page.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-4">
          {errorMessage != null && (
            <Alert variant="error">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <TextField
            id="add-domain-hostname"
            label="Hostname"
            value={hostname}
            onChange={(event) => setHostname(event.target.value)}
            error={errors.hostname}
            helperText="The zone must already exist in the Cloudflare account, e.g. jesus.movie"
            autoComplete="off"
            autoFocus
          />
          <TextField
            id="add-domain-path-prefix"
            label="Path prefix"
            value={pathPrefix}
            onChange={(event) => setPathPrefix(event.target.value)}
            error={errors.pathPrefix}
            helperText="Path the short links live under, without slashes, e.g. s. Leave empty to give the whole hostname to short links."
            autoComplete="off"
          />
        </DialogPanel>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} loading={loading}>
            Add domain
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
