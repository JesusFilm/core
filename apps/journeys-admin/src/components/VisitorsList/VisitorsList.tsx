import { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
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

export const GET_VISITORS = gql`
  query GetVisitors($first: Int, $after: String) {
    visitors: visitorsConnection(
      teamId: "jfp-team"
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
  const router = useRouter()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [endCursor, setEndCursor] = useState<string | null>()

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
    if (hasNextPage) {
      const response = await fetchMore({
        variables: {
          first: 100,
          after: endCursor
        }
      })
      if (response.data.visitors.edges != null) {
        setVisitors([...visitors, ...response.data.visitors.edges])
        setHasNextPage(response.data.visitors.pageInfo.hasNextPage)
        setEndCursor(response.data.visitors.pageInfo.endCursor)
      }
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('ID'),
      width: 100
    },
    {
      field: 'lastStepViewedAt',
      headerName: t('Last Active'),
      width: 300
    },
    {
      field: 'lastChatPlatform',
      headerName: t('Chat Started'),
      width: 300
    },
    {
      field: 'lastLinkAction',
      headerName: t('Action'),
      width: 300
    },
    {
      field: 'lastTextResponse',
      headerName: t('User Data'),
      width: 300
    },
    {
      field: 'lastRadioQuestion',
      headerName: t('Polls'),
      width: 300
    }
  ]

  const rows = visitors.map((visitor) => {
    const {
      id,
      lastStepViewedAt,
      lastChatPlatform,
      lastLinkAction,
      lastTextResponse,
      lastRadioQuestion,
      lastRadioOptionSubmission
    } = visitor.node

    return {
      id,
      lastStepViewedAt:
        lastStepViewedAt != null
          ? new Intl.DateTimeFormat([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            }).format(new Date(lastStepViewedAt))
          : null,
      lastChatPlatform,
      lastLinkAction,
      lastTextResponse,
      lastRadioQuestion:
        lastRadioQuestion != null && lastRadioOptionSubmission != null
          ? `${lastRadioQuestion}: ${lastRadioOptionSubmission}`
          : null
    }
  })

  async function handleRowClick(params): Promise<void> {
    await router.push(`/reports/visitors/${params.row.id as string}`)
  }

  return (
    <Stack spacing={20} sx={{ alignItems: 'center' }}>
      <Box sx={{ height: '85vh', width: '100%' }}>
        <StyledDataGrid
          columns={columns}
          rows={rows}
          loading={loading}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          columnVisibilityModel={{
            id: false
          }}
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
