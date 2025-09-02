import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'

import { GetJourneyVisitors_visitors_edges as VisitorEdge } from '../../../__generated__/GetJourneyVisitors'
import VisitorsPlaceholder from '../../../public/VisitorsPlaceholder.svg'

import { VisitorCard } from './VisitorCard'

interface JourneyVisitorsListProps {
  visitorEdges?: VisitorEdge[]
  visitorsCount?: number
  fetchNext: () => void
  loading: boolean
  hasNextPage?: boolean
}

export function JourneyVisitorsList({
  visitorEdges,
  visitorsCount,
  fetchNext,
  loading,
  hasNextPage = false
}: JourneyVisitorsListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const hasVisitors = visitorEdges != null && visitorEdges.length > 0
  return (
    <Container disableGutters data-testid="JourneysAdminJourneyVisitorsList">
      <Stack
        spacing={6}
        alignItems="center"
        sx={{ height: '100%', mx: { xs: -6, sm: 0 } }}
      >
        {loading ? (
          <Box sx={{ mx: { xs: -6, sm: 0 }, width: '100%' }}>
            {[0, 1, 2, 3].map((index) => (
              <VisitorCard key={index} loading={loading} />
            ))}
          </Box>
        ) : hasVisitors ? (
          <Box sx={{ mx: { xs: -6, sm: 0 }, width: '100%' }}>
            {visitorEdges?.map((visitor) => (
              <VisitorCard
                key={visitor.node.visitorId}
                visitorNode={visitor.node}
                loading={loading}
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
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
        )}

        {hasVisitors && visitorsCount != null && (
          <Typography>
            {t(
              'Showing {{ shownVisitors }} visitors out of {{ visitorsCount }}',
              {
                shownVisitors: visitorEdges?.length as unknown as string,
                visitorsCount
              }
            )}
          </Typography>
        )}

        <Button
          startIcon={<AddSquare4Icon />}
          variant="outlined"
          onClick={fetchNext}
          disabled={!hasNextPage}
          loading={loading}
          color="secondary"
          sx={{ display: hasVisitors ? 'flex' : 'none' }}
        >
          {t('Load More')}
        </Button>
      </Stack>
    </Container>
  )
}
