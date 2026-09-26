'use client'

import { useLazyQuery, useQuery } from '@apollo/client/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { FormEvent, ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { StatusChip } from '../../../../components/StatusChip'
import {
  GET_SHORT_LINK_DOMAINS,
  SHORT_LINK_FIELDS
} from '../../../../libs/shortLink'

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
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 900 }}>
      <Typography component="h2" variant="h6">
        Test Redirect
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Resolves a short URL exactly as the edge Worker would, without
        redirecting anyone or recording a scan.
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Stack
          component="form"
          onSubmit={handleSubmit}
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'flex-start' } }}
        >
          <TextField
            select
            label="Hostname"
            value={selectedHostname}
            onChange={(event) => setHostname(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            {domains.map((domain) => (
              <MenuItem key={domain.id} value={domain.hostname}>
                {domain.hostname}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Pathname"
            value={pathname}
            onChange={(event) => setPathname(event.target.value)}
            placeholder="abc123"
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { 'aria-label': 'Pathname' } }}
          />
          <Button
            type="submit"
            variant="contained"
            loading={loading}
            disabled={selectedHostname === ''}
          >
            Resolve
          </Button>
        </Stack>
      </Paper>

      {error != null && <Alert severity="error">{error.message}</Alert>}

      {resolution != null && (
        <Paper sx={{ p: 2 }} data-testid="ResolutionResult">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', mb: 2 }}
          >
            <Chip
              label={resolution.found ? 'Found' : 'Not found'}
              color={resolution.found ? 'success' : 'error'}
              size="small"
            />
            <Chip label={`HTTP ${resolution.status}`} size="small" />
            <Chip
              label={SOURCE_LABELS[resolution.source] ?? resolution.source}
              size="small"
              variant="outlined"
            />
          </Stack>
          <Table size="small" aria-label="Resolution">
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: 160 }}>Location</TableCell>
                <TableCell sx={{ wordBreak: 'break-all' }}>
                  {resolution.location != null ? (
                    <Link
                      href={resolution.location}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {resolution.location}
                    </Link>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      none (lost page)
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              {resolution.shortLink != null && (
                <>
                  <TableRow>
                    <TableCell>Matched link</TableCell>
                    <TableCell>
                      <Link
                        component={NextLink}
                        href={`/links/${resolution.shortLink.id}`}
                      >
                        {resolution.shortLink.shortUrl}
                      </Link>
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
                    <TableCell sx={{ wordBreak: 'break-all' }}>
                      {resolution.shortLink.to}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}
