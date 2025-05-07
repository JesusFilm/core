import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

function LoadingJourneyCard(): ReactElement {
  return (
    <Card
      variant="outlined"
      sx={{
        aspectRatio: { xs: '1', sm: '1/1.3' },
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&:last-of-type': {
          borderBottomLeftRadius: '4%',
          borderBottomRightRadius: '4%',
          borderTopLeftRadius: '4%',
          borderTopRightRadius: '4%',
          borderBottom: '1px solid',
          borderColor: 'divider'
        },
        height: '100%'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 'auto',
          aspectRatio: {
            xs: '1.9',
            sm: '1.43'
          },
          mx: { xs: 3, sm: 2 },
          mt: { xs: 3, sm: 2 },
          borderRadius: '4%',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120
        }}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%'
          }}
        />
      </Box>
      <CardContent sx={{ pl: 2, pr: 2, pb: 3, pt: 1 }}>
        <Skeleton variant="text" width="100%" height={25} />
        <Skeleton variant="text" width="60%" height={25} />
      </CardContent>
      <Box
        sx={{
          position: 'absolute',
          bottom: 3,
          left: 8,
          right: 8,
          zIndex: 3,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Skeleton variant="text" width={80} height={25} />
          <Skeleton variant="circular" width={27} height={27} />
        </Stack>
      </Box>
    </Card>
  )
}

interface LoadingJourneyListProps {
  hideHelperText?: boolean
}

export function LoadingJourneyList({
  hideHelperText = false
}: LoadingJourneyListProps): ReactElement {
  return (
    <>
      <Box sx={{ mt: 5 }}>
        <Grid container spacing={5} rowSpacing={5}>
          {[0, 1, 2].map((index) => (
            <Grid
              key={`journeyCard${index}`}
              size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}
            >
              <LoadingJourneyCard />
            </Grid>
          ))}
        </Grid>
      </Box>
      {!hideHelperText && (
        <Stack alignItems="center">
          <Typography
            variant="caption"
            align="center"
            component="div"
            sx={{ py: { xs: 3, sm: 5 }, maxWidth: 290 }}
          >
            <Skeleton variant="text" width={255} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={220} sx={{ mx: 'auto' }} />
          </Typography>
        </Stack>
      )}
    </>
  )
}
