import { ReactElement } from 'react'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import { GetJourneyVisitors_visitors_edges as VisitorEdge } from '../../../__generated__/GetJourneyVisitors'
import VisitorsPlaceholder from '../../../public/VisitorsPlaceholder.svg'
import { VisitorCard } from './VisitorCard'

interface Props {
  visitorEdges?: VisitorEdge[]
  visitorsCount?: number
  fetchNext: () => Promise<void>
  loading: boolean
  hasNextPage: boolean
}

export function JourneyVisitorsList({
  visitorEdges,
  visitorsCount,
  fetchNext,
  loading,
  hasNextPage
}: Props): ReactElement {
  const hasVisitors = visitorEdges != null && visitorEdges.length > 0
  return (
    <Stack
      spacing={6}
      alignItems="center"
      sx={{ width: '100%', height: '100%' }}
    >
      {hasVisitors ? (
        <Box sx={{ mx: { xs: -6, sm: 0 }, width: '100%' }}>
          {visitorEdges.map((visitor) => (
            <VisitorCard
              key={visitor.node.visitorId}
              visitorNode={visitor.node}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ m: 'auto' }}>
          <Image
            src={VisitorsPlaceholder}
            alt="visitors-placeholder"
            width={384}
            height={245.69}
          />
        </Box>
      )}

      {hasVisitors && visitorsCount != null && (
        <Typography>
          {`Showing ${visitorEdges.length} visitors out of ${visitorsCount}`}
        </Typography>
      )}

      <LoadingButton
        variant="outlined"
        onClick={fetchNext}
        disabled={!hasNextPage}
        loading={loading}
        sx={{ width: '250px', display: hasVisitors ? 'flex' : 'none' }}
      >
        Load More
      </LoadingButton>
    </Stack>
  )
}
