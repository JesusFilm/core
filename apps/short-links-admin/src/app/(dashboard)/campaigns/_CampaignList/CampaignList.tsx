'use client'

import { useQuery } from '@apollo/client/react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyboardEvent, ReactElement, useEffect, useState } from 'react'

import { graphql } from '@core/shared/gql'

import {
  SHORT_LINK_CAMPAIGN_FIELDS,
  formatDate
} from '../../../../libs/shortLink'

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
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 1100 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography component="h2" variant="h6">
          Campaigns
        </Typography>
        <Button
          component={NextLink}
          href="/campaigns/new"
          variant="contained"
          startIcon={<AddRoundedIcon />}
        >
          New campaign
        </Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <TextField
          placeholder="Search campaigns"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 320 }, mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            },
            htmlInput: { 'aria-label': 'Search campaigns' }
          }}
        />
        {error != null && <Alert severity="error">{error.message}</Alert>}
        <TableContainer>
          <Table size="small" aria-label="Campaigns">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Starts</TableCell>
                <TableCell>Ends</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="right">Links</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  hover
                  tabIndex={0}
                  role="link"
                  aria-label={campaign.name}
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  onKeyDown={(event) => handleRowKeyDown(event, campaign.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{formatDate(campaign.startsAt)}</TableCell>
                  <TableCell>{formatDate(campaign.endsAt)}</TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      {campaign.tags.map((tag) => (
                        <Chip key={tag} size="small" label={tag} />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{campaign.linkCount}</TableCell>
                </TableRow>
              ))}
              {!loading && campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: 'text.secondary' }}>
                    No campaigns yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" sx={{ justifyContent: 'center', mt: 2 }}>
          {loading && <CircularProgress size={24} />}
          {!loading && connection?.pageInfo.hasNextPage === true && (
            <Button onClick={handleLoadMore}>Load more</Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}
