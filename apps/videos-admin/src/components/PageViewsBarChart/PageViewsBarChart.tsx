import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function PageViewsBarChart(): ReactElement {
  const t = useTranslations()
  const theme = useTheme()
  const colorPalette = [
    theme.palette.primary.dark,
    theme.palette.primary.main,
    theme.palette.primary.light
  ]
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {t('Page views and downloads')}
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography variant="h4" component="p">
              {t('1.3M')}
            </Typography>
            <Chip size="small" color="error" label="-8%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('Page views and downloads for the last 6 months')}
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
            }
          ]}
          series={[
            {
              id: 'page-views',
              label: 'Page views',
              data: [2234, 3872, 2998, 4125, 3357, 2789, 2998],
              stack: 'A'
            },
            {
              id: 'downloads',
              label: 'Downloads',
              data: [3098, 4215, 2384, 2101, 4752, 3593, 2384],
              stack: 'A'
            },
            {
              id: 'conversions',
              label: 'Conversions',
              data: [4051, 2275, 3129, 4693, 3904, 2038, 2275],
              stack: 'A'
            }
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true
            }
          }}
        />
      </CardContent>
    </Card>
  )
}
