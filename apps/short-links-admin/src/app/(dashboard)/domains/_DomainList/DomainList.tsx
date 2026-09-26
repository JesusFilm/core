'use client'

import { useQuery } from '@apollo/client/react'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { KeyboardEvent, ReactElement } from 'react'

import {
  GET_SHORT_LINK_DOMAINS,
  NOT_FOUND_OPTIONS,
  formatDateTime,
  labelFor
} from '../../../../libs/shortLink'

export function DomainList(): ReactElement {
  const router = useRouter()
  const { data, loading, error } = useQuery(GET_SHORT_LINK_DOMAINS)

  const domains =
    data?.shortLinkDomains.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    id: string
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      router.push(`/domains/${id}`)
    }
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 1300 }}>
      <Typography component="h2" variant="h6">
        Domains
      </Typography>
      <Paper sx={{ p: 2 }}>
        {error != null && <Alert severity="error">{error.message}</Alert>}
        {loading && <CircularProgress size={24} />}
        <TableContainer>
          <Table size="small" aria-label="Domains">
            <TableHead>
              <TableRow>
                <TableCell>Hostname</TableCell>
                <TableCell>Services</TableCell>
                <TableCell>Redirect</TableCell>
                <TableCell>Not found</TableCell>
                <TableCell>Fallback</TableCell>
                <TableCell>Passthrough origin</TableCell>
                <TableCell align="right">Links</TableCell>
                <TableCell>Edge published</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {domains.map((domain) => (
                <TableRow
                  key={domain.id}
                  hover
                  tabIndex={0}
                  role="link"
                  aria-label={domain.hostname}
                  onClick={() => router.push(`/domains/${domain.id}`)}
                  onKeyDown={(event) => handleRowKeyDown(event, domain.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{domain.hostname}</TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      {domain.services.length === 0 ? (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          All services
                        </Typography>
                      ) : (
                        domain.services.map((service) => (
                          <Chip key={service} size="small" label={service} />
                        ))
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{domain.redirectStatus}</TableCell>
                  <TableCell>
                    {labelFor(NOT_FOUND_OPTIONS, domain.notFound)}
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-all' }}>
                    {domain.fallbackTo ?? ''}
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-all' }}>
                    {domain.passthroughOrigin ?? ''}
                  </TableCell>
                  <TableCell align="right">{domain.linkCount}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {domain.edgePublishedAt != null
                      ? formatDateTime(domain.edgePublishedAt)
                      : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  )
}
