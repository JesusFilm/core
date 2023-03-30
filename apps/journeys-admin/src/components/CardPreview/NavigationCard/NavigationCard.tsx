import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

interface NavigationCardProps {
  id: string
  title: string
  destination: ActiveJourneyEditContent
  outlined?: boolean
  header?: ReactElement
  loading?: boolean
  testId?: string
}

export function NavigationCard({
  id,
  title,
  outlined = false,
  header,
  loading = false,
  testId
}: NavigationCardProps): ReactElement {
  return (
    <Box
      id={id}
      data-testid={testId}
      sx={{
        height: '150px',
        width: '101px',
        borderRadius: '8px',
        p: 1,
        pt: 1,
        mt: -1,
        outline: (theme) =>
          outlined
            ? `2px solid ${theme.palette.primary.main} `
            : '2px solid transparent'
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: 87,
          height: 132,
          m: 1,
          border: '3x solid transparent'
        }}
      >
        {loading ? (
          <Skeleton variant="rectangular" width={87} height={132} />
        ) : (
          <CardActionArea>
            <Stack
              direction="column"
              justifyContent="center"
              alignContent="center"
              gap={1}
            >
              <Box
                display="flex"
                width="100%"
                height="80px"
                justifyContent="center"
                alignItems="center"
                mt={1}
              >
                {header}
              </Box>
              <Typography
                variant="subtitle1"
                textAlign="center"
                sx={{ fontSize: 14, lineHeight: '16px' }}
                px={2}
              >
                {title}
              </Typography>
            </Stack>
          </CardActionArea>
        )}
      </Card>
    </Box>
  )
}
