import { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import LoadingButton from '@mui/lab/LoadingButton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import {
  GetVisitors,
  GetVisitors_visitors_edges as Visitor
} from '../../../__generated__/GetVisitors'
import { useTeam } from '../Team/TeamProvider'
import { getColDefs } from './utils/getColDefs'
import { getVisitorRows } from './utils/getVisitorRows'

export const GET_VISITORS = gql`
  query GetVisitors($first: Int, $after: String, $teamId: String!) {
    visitors: visitorsConnection(
      teamId: $teamId
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          lastChatPlatform
          lastStepViewedAt
          lastLinkAction
          lastTextResponse
          lastRadioQuestion
          lastRadioOptionSubmission
        }
        cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  overflow: 'hidden',
  '& .MuiDataGrid-row': {
    maxHeight: '300px',
    borderTop: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      cursor: 'pointer'
    }
  },
  '& .MuiDataGrid-row--lastVisible': {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  '& .MuiDataGrid-cell:focus': {
    outline: 'none'
  }
}))

export function VisitorsList(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const router = useRouter()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [endCursor, setEndCursor] = useState<string | null>()
  const columns = getColDefs(t)

  const { fetchMore, loading } = useQuery<GetVisitors>(GET_VISITORS, {
    variables: {
      first: 100
    },
    onCompleted: (data) => {
      setVisitors(data.visitors.edges)
      setHasNextPage(data.visitors.pageInfo.hasNextPage)
      setEndCursor(data.visitors.pageInfo.endCursor)
    }
  })

  async function handleFetchNext(): Promise<void> {
    if (hasNextPage && activeTeam != null) {
      const response = await fetchMore({
        variables: {
          first: 100,
          after: endCursor,
          teamId: activeTeam.id
        }
      })
      if (response.data.visitors.edges != null) {
        setVisitors([...visitors, ...response.data.visitors.edges])
        setHasNextPage(response.data.visitors.pageInfo.hasNextPage)
        setEndCursor(response.data.visitors.pageInfo.endCursor)
      }
    }
  }

  const rows = getVisitorRows(visitors)

  async function handleRowClick(params): Promise<void> {
    await router.push(`/reports/visitors/${params.row.id as string}`)
  }

  return (
    <Stack
      spacing={6}
      sx={{
        height: { xs: '600px', sm: '600px', md: '100%' },
        alignItems: 'center'
      }}
    >
      <Box sx={{ height: '95%', width: '100%' }}>
        <StyledDataGrid
          columns={columns}
          rows={rows}
          loading={loading}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          columnVisibilityModel={{
            id: false
          }}
          getRowHeight={() => 'auto'}
        />
      </Box>
      <LoadingButton
        variant="outlined"
        onClick={handleFetchNext}
        disabled={!hasNextPage}
        loading={loading}
        sx={{ width: '250px' }}
      >
        {t('Load More')}
      </LoadingButton>
    </Stack>
  )
}
