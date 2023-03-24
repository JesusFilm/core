import { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
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
          createdAt
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
  const router = useRouter()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [endCursor, setEndCursor] = useState<string | null>()

  const { fetchMore } = useQuery<GetVisitors>(GET_VISITORS, {
    variables: {
      first: 10
    },
    onCompleted: (data) => {
      setVisitors(data.visitors.edges)
      setHasNextPage(data.visitors.pageInfo.hasNextPage)
      setEndCursor(data.visitors.pageInfo.endCursor)
    }
  })

  async function handleFetchMore(): Promise<void> {
    if (hasNextPage) {
      const response = await fetchMore({
        variables: {
          first: 10,
          after: endCursor
        }
      })
      if (response.data.visitors.edges != null) {
        setVisitors(response.data.visitors.edges)
        setHasNextPage(response.data.visitors.pageInfo.hasNextPage)
        setEndCursor(response.data.visitors.pageInfo.endCursor)
      }
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'lastStepViewedAt',
      headerName: 'Last Active',
      width: 300
    },
    {
      field: 'lastChatPlatform',
      headerName: 'Chat Started',
      width: 300
    },
    {
      field: 'lastLinkAction',
      headerName: 'Action',
      width: 300
    },
    {
      field: 'lastTextResponse',
      headerName: 'User Data',
      width: 300
    },
    {
      field: 'lastRadioQuestion',
      headerName: 'Polls',
      width: 300
    }
  ]

  const rows = visitors.map((visitor) => {
    return {
      id: visitor.node.id,
      createdAt: new Intl.DateTimeFormat('en-us', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(visitor.node.createdAt))
    }
  })

  async function handleRowClick(params): Promise<void> {
    await router.push(`/reports/visitors/${params.row.id as string}`)
  }

  return (
    <>
      <Box sx={{ height: '60vh', width: '100%' }}>
        <StyledDataGrid
          columns={columns}
          rows={rows}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          // columnVisibilityModel={{
          //   id: false
          // }}
          // initialState={{
          //   pagination: {
          //     paginationModel: {
          //       pageSize: 10
          //     }
          //   }
          // }}
          // pageSizeOptions={[10]}
        />
      </Box>
      <Button onClick={handleFetchMore}>Fetch More</Button>
    </>
  )
}
