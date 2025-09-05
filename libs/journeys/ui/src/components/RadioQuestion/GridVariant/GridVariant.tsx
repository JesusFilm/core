import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import { StyledGridRadioOption } from '../../RadioOption/GridVariant'

const StyledGridRadioQuestion = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

interface GridVariantProps {
  options: (ReactElement | false)[]
  addOption?: () => void
  blockId: string
}

export function GridVariant({
  options,
  addOption,
  blockId
}: GridVariantProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <StyledGridRadioQuestion
      container
      spacing={2}
      data-testid={`JourneysRadioQuestionGrid-${blockId}`}
    >
      {options.map((option, index) => (
        <Grid key={index} size={6}>
          {option}
        </Grid>
      ))}
      {addOption && (
        <Grid size={6}>
          <Box sx={{ minHeight: '130px', minWidth: '130px' }}>
            <StyledGridRadioOption onClick={addOption}>
              <Stack
                alignItems="center"
                justifyContent="center"
                gap={3}
                sx={{
                  height: '100%'
                }}
              >
                <AddSquare4Icon
                  sx={{
                    color: `${adminPrimaryColor.main}`,
                    height: '32px',
                    width: '32px'
                  }}
                />
                <Typography
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#1D1D1D' : '#FFFFFF'
                  }}
                  variant="body2"
                >
                  {t('Add Option')}
                </Typography>
              </Stack>
            </StyledGridRadioOption>
          </Box>
        </Grid>
      )}
    </StyledGridRadioQuestion>
  )
}
