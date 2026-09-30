'use client'

import { useQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { KeyboardEvent, ReactElement } from 'react'

import {
  GET_SHORT_LINK_DOMAINS,
  NOT_FOUND_OPTIONS,
  formatDateTime,
  labelFor
} from '../../../../libs/shortLink'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardPanel } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

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
    <div className="flex w-full max-w-7xl flex-col gap-4">
      <h2 className="text-lg font-semibold">Domains</h2>
      <Card>
        <CardPanel className="flex flex-col gap-3">
          {error != null && (
            <Alert variant="error">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          {loading && <Spinner aria-label="Loading domains" />}
          <div className="overflow-x-auto">
            <Table aria-label="Domains">
              <TableHeader>
                <TableRow>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Path prefix</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Redirect</TableHead>
                  <TableHead>Not found</TableHead>
                  <TableHead>Fallback</TableHead>
                  <TableHead>Passthrough origin</TableHead>
                  <TableHead className="text-right">Links</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Edge published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => {
                  const published =
                    domain.kvNamespaceId != null && domain.kvNamespaceId !== ''
                  return (
                    <TableRow
                      key={domain.id}
                      tabIndex={0}
                      role="link"
                      aria-label={domain.hostname}
                      onClick={() => router.push(`/domains/${domain.id}`)}
                      onKeyDown={(event) => handleRowKeyDown(event, domain.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>{domain.hostname}</TableCell>
                      <TableCell>
                        {domain.pathPrefix === ''
                          ? '(root)'
                          : domain.pathPrefix}
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-wrap gap-1">
                          {domain.services.length === 0 ? (
                            <span className="text-muted-foreground text-xs">
                              All services
                            </span>
                          ) : (
                            domain.services.map((service) => (
                              <Badge key={service} variant="secondary">
                                {service}
                              </Badge>
                            ))
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{domain.redirectStatus}</TableCell>
                      <TableCell>
                        {labelFor(NOT_FOUND_OPTIONS, domain.notFound)}
                      </TableCell>
                      <TableCell className="break-all">
                        {domain.fallbackTo ?? ''}
                      </TableCell>
                      <TableCell className="break-all">
                        {domain.passthroughOrigin ?? ''}
                      </TableCell>
                      <TableCell className="text-right">
                        {domain.linkCount}
                      </TableCell>
                      <TableCell>
                        <Badge variant={published ? 'success' : 'outline'}>
                          {published ? 'edge' : 'not published'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {domain.edgePublishedAt != null
                          ? formatDateTime(domain.edgePublishedAt)
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardPanel>
      </Card>
    </div>
  )
}
