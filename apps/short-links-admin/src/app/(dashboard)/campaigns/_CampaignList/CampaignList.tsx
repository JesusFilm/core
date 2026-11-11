'use client'

import { useQuery } from '@apollo/client/react'
import { PlusIcon, SearchIcon } from 'lucide-react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyboardEvent, ReactElement, useEffect, useState } from 'react'

import { graphql } from '@core/shared/gql'

import {
  SHORT_LINK_CAMPAIGN_FIELDS,
  formatDate
} from '../../../../libs/shortLink'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export const GET_SHORT_LINK_CAMPAIGNS = graphql(
  `
    query GetShortLinkCampaigns($search: String, $first: Int, $after: String) {
      shortLinkCampaigns(search: $search, first: $first, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            ...ShortLinkCampaignFields
          }
        }
      }
    }
  `,
  [SHORT_LINK_CAMPAIGN_FIELDS]
)

const PAGE_SIZE = 25

export function CampaignList(): ReactElement {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState<string | undefined>()

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = searchTerm.trim() === '' ? undefined : searchTerm.trim()
      setSearch(next)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const { data, loading, error, fetchMore } = useQuery(
    GET_SHORT_LINK_CAMPAIGNS,
    { variables: { search, first: PAGE_SIZE, after: undefined } }
  )

  const connection = data?.shortLinkCampaigns
  const campaigns =
    connection?.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []

  function handleLoadMore(): void {
    const endCursor = connection?.pageInfo.endCursor
    if (endCursor == null) return
    void fetchMore({
      variables: { search, first: PAGE_SIZE, after: endCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        shortLinkCampaigns: {
          ...fetchMoreResult.shortLinkCampaigns,
          edges: [
            ...(previous.shortLinkCampaigns.edges ?? []),
            ...(fetchMoreResult.shortLinkCampaigns.edges ?? [])
          ]
        }
      })
    })
  }

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    id: string
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      router.push(`/campaigns/${id}`)
    }
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Campaigns</h2>
        <Button render={<NextLink href="/campaigns/new" />}>
          <PlusIcon aria-hidden="true" />
          New campaign
        </Button>
      </div>
      <Card>
        <CardPanel className="flex flex-col gap-4">
          <InputGroup className="w-full sm:w-80">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search campaigns"
              placeholder="Search campaigns"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </InputGroup>
          {error != null && (
            <Alert variant="error">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <Table aria-label="Campaigns">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  tabIndex={0}
                  role="link"
                  aria-label={campaign.name}
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  onKeyDown={(event) => handleRowKeyDown(event, campaign.id)}
                  className="cursor-pointer"
                >
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{formatDate(campaign.startsAt)}</TableCell>
                  <TableCell>{formatDate(campaign.endsAt)}</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1">
                      {campaign.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.linkCount}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No campaigns yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-center">
            {loading && <Spinner aria-label="Loading campaigns" />}
            {!loading && connection?.pageInfo.hasNextPage === true && (
              <Button variant="outline" onClick={handleLoadMore}>
                Load more
              </Button>
            )}
          </div>
        </CardPanel>
      </Card>
    </div>
  )
}
