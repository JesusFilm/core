import { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import LoadingButton from '@mui/lab/LoadingButton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import TextField from '@mui/material/TextField'
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

interface CellTextFieldProps {
  value: string
}
const CellTextField = ({ value }: CellTextFieldProps): ReactElement => (
  <TextField
    variant="standard"
    value={value}
    multiline
    maxRows={3}
    fullWidth
    disabled
    InputProps={{
      disableUnderline: true
    }}
    sx={{
      p: 0,
      '& .MuiInputBase-input.Mui-disabled': {
        fontSize: '14px',
        WebkitTextFillColor: 'black',
        '&:hover': {
          cursor: 'pointer'
        }
      }
    }}
  />
)

interface GridRowDef {
  id: string
  lastStepViewedAt: string | null
  lastChatPlatform: string | null
  lastLinkAction: string | null
  lastTextResponse: string
  lastRadioQuestion: string
}

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
      headerName: t('ID')
    },
    {
      field: 'lastStepViewedAt',
      headerName: t('Last Active'),
      width: 200
    },
    {
      field: 'lastChatPlatform',
      headerName: t('Chat Started'),
      width: 200
    },
    {
      field: 'lastLinkAction',
      headerName: t('Action'),
      width: 400
    },
    {
      field: 'lastTextResponse',
      headerName: t('User Data'),
      flex: 1,
      minWidth: 300,
      renderCell: (cellValues) => <CellTextField value={cellValues.value} />
    },
    {
      field: 'lastRadioQuestion',
      headerName: t('Polls'),
      flex: 1,
      minWidth: 300,
      renderCell: (cellValues) => <CellTextField value={cellValues.value} />
    }
  ]

  const rows: GridRowDef[] = []
  visitors.forEach((visitor) => {
    const {
      id,
      lastStepViewedAt,
      lastChatPlatform,
      lastLinkAction,
      lastTextResponse,
      lastRadioQuestion,
      lastRadioOptionSubmission
    } = visitor.node

    if (lastStepViewedAt != null) {
      rows.push({
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
        lastTextResponse: lastTextResponse ?? '',
        lastRadioQuestion:
          lastRadioQuestion != null && lastRadioOptionSubmission != null
            ? `${lastRadioQuestion}: ${lastRadioOptionSubmission}`
            : ''
      })
    }
  })

  async function handleRowClick(params): Promise<void> {
    await router.push(`/reports/visitors/${params.row.id as string}`)
  }

  return (
    <Stack
      spacing={6}
      sx={{
        height: { xs: '600px', sm: '100%' },
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
