'use client'

import { useLazyQuery, useQuery } from '@apollo/client/react'
import NextLink from 'next/link'
import { FormEvent, ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { SelectField, TextField } from '../../../../components/form'
import { StatusChip } from '../../../../components/StatusChip'
import {
  GET_SHORT_LINK_DOMAINS,
  SHORT_LINK_FIELDS,
  formatDomainLabel
} from '../../../../libs/shortLink'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

export const SHORT_LINK_RESOLVE = graphql(
  `
    query ShortLinkResolve($hostname: String!, $pathname: String!) {
      shortLinkResolve(hostname: $hostname, pathname: $pathname) {
        found
        location
        status
        source
        shortLink {
          ...ShortLinkFields
        }
      }
    }
  `,
  [SHORT_LINK_FIELDS]
)

const SOURCE_LABELS: Record<string, string> = {
  link: 'Matched link',
  linkFallback: 'Paused link fallback',
  domainFallback: 'Domain fallback',
  passthrough: 'Passthrough to origin',
  lostPage: 'Lost page',
  reserved: 'Reserved path'
}

export function TestRedirect(): ReactElement {
  const [hostname, setHostname] = useState('')
  const [pathname, setPathname] = useState('')
  const { data: domainData } = useQuery(GET_SHORT_LINK_DOMAINS)
  const [resolve, { data, loading, error }] = useLazyQuery(SHORT_LINK_RESOLVE, {
    fetchPolicy: 'network-only'
  })

  const domains =
    domainData?.shortLinkDomains.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []
  const selectedHostname =
    hostname !== '' ? hostname : (domains[0]?.hostname ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (selectedHostname === '') return
    void resolve({
      variables: {
        hostname: selectedHostname,
        pathname: pathname.trim().replace(/^\/+/, '')
      }
    })
  }

  const resolution = data?.shortLinkResolve

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Test Redirect</h2>
        <p className="text-muted-foreground text-sm">
          Resolves a short URL exactly as the edge Worker would, without
          redirecting anyone or recording a scan.
        </p>
      </div>
      <Card>
        <CardPanel>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:flex-row md:items-end"
          >
            <SelectField
              id="test-hostname"
              label="Hostname"
              value={selectedHostname}
              onValueChange={setHostname}
              options={domains.map((domain) => ({
                value: domain.hostname,
                label: formatDomainLabel(domain)
              }))}
              className="md:w-56"
            />
            <TextField
              id="test-pathname"
              label="Pathname"
              value={pathname}
              onChange={(event) => setPathname(event.target.value)}
              placeholder="abc123"
              className="flex-1"
            />
            <Button
              type="submit"
              loading={loading}
              disabled={selectedHostname === ''}
            >
              Resolve
            </Button>
          </form>
        </CardPanel>
      </Card>

      {error != null && (
        <Alert variant="error">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {resolution != null && (
        <Card data-testid="ResolutionResult">
          <CardPanel className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={resolution.found ? 'success' : 'error'}>
                {resolution.found ? 'Found' : 'Not found'}
              </Badge>
              <Badge variant="secondary">HTTP {resolution.status}</Badge>
              <Badge variant="outline">
                {SOURCE_LABELS[resolution.source] ?? resolution.source}
              </Badge>
            </div>
            <Table aria-label="Resolution">
              <TableBody>
                <TableRow>
                  <TableCell className="w-40">Location</TableCell>
                  <TableCell className="break-all">
                    {resolution.location != null ? (
                      <a
                        href={resolution.location}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {resolution.location}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        none (lost page)
                      </span>
                    )}
                  </TableCell>
                </TableRow>
                {resolution.shortLink != null && (
                  <>
                    <TableRow>
                      <TableCell>Matched link</TableCell>
                      <TableCell>
                        <NextLink
                          href={`/links/${resolution.shortLink.id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {resolution.shortLink.shortUrl}
                        </NextLink>
                        {resolution.shortLink.name != null &&
                          ` · ${resolution.shortLink.name}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Link status</TableCell>
                      <TableCell>
                        <StatusChip status={resolution.shortLink.status} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Destination</TableCell>
                      <TableCell className="break-all">
                        {resolution.shortLink.to}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </CardPanel>
        </Card>
      )}
    </div>
  )
}
