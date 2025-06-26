import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
// import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Typography } from '@core/journeys/ui/Typography'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from 'libs/journeys/ui/__generated__/globalTypes'
import Box from '@mui/material/Box'

interface ThemePreviewProps {
  headerFont: string
  bodyFont: string
  labelsFont: string
}

export function ThemePreview({
  headerFont,
  bodyFont,
  labelsFont
}: ThemePreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box sx={{ minHeight: 860, minWidth: 476 }}>
      <Card
        variant="outlined"
        sx={{ width: '100%', bgcolor: '#f8f9fa', borderRadius: 2 }}
      >
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <Typography
              variant={TypographyVariant.h1}
              align={TypographyAlign.center}
              color={TypographyColor.secondary}
              content={t('Display Text')}
            />

            {/* <Typography
            variant="h4"
            align="center"
            sx={{
              fontFamily: headerFont,
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}
          >
            {t('This is a Heading')}
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{
              fontFamily: bodyFont,
              fontSize: '1.2rem',
              fontWeight: 'medium'
            }}
          >
            {t('This is a subheading that supports additional content')}
          </Typography>

          <Typography
            variant="body1"
            align="center"
            sx={{
              fontFamily: bodyFont,
              maxWidth: '80%'
            }}
          >
            {t(
              'This is body text, used for general content like paragraphs and instructions.'
            )}
          </Typography> */}

            <Button
              variant="contained"
              color="primary"
              sx={{
                fontFamily: labelsFont,
                borderRadius: 8,
                px: 4
              }}
            >
              {t('Button')}
            </Button>

            <Paper
              elevation={0}
              sx={{
                bgcolor: 'rgba(200, 200, 200, 0.3)',
                p: 2,
                width: '100%',
                borderRadius: 2
              }}
            >
              <Stack spacing={1}>
                <Typography sx={{ fontFamily: labelsFont }}>
                  {t('Poll Block Option')}
                </Typography>
                <Paper
                  sx={{
                    height: 1,
                    bgcolor: 'rgba(200, 200, 200, 0.3)',
                    width: '100%'
                  }}
                />
                <Typography sx={{ fontFamily: labelsFont }}>
                  {t('Poll Block Option')}
                </Typography>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                bgcolor: 'rgba(200, 200, 200, 0.3)',
                p: 2,
                width: '100%',
                borderRadius: 2
              }}
            >
              <Typography sx={{ fontFamily: labelsFont }}>
                {t('Multiselect Block Option')}
              </Typography>
            </Paper>

            <Stack spacing={1} width="100%">
              <Typography sx={{ fontFamily: labelsFont }}>
                {t('Label')}
              </Typography>
              <TextField
                placeholder={t('Placeholder Text')}
                fullWidth
                InputProps={{
                  sx: { fontFamily: labelsFont }
                }}
                disabled
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
