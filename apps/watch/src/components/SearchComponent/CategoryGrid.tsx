import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Grid from '@mui/material/GridLegacy'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Bible from '@core/shared/ui/icons/Bible'
import Book from '@core/shared/ui/icons/Book'
import Calendar1 from '@core/shared/ui/icons/Calendar1'
import Play1 from '@core/shared/ui/icons/Play1'
import Star2 from '@core/shared/ui/icons/Star2'
import VideoOn from '@core/shared/ui/icons/VideoOn'

interface CategoryItem {
  title: string
  icon: React.ComponentType<any>
  gradient: string
  searchTerm: string
}

export interface CategoryGridProps {
  onCategorySelect: (searchTerm: string) => void
}

const CategoryTile = styled(ButtonBase)(({ theme }) => ({
  borderRadius: 8,
  aspectRatio: '16 / 9',
  width: '100%',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.02)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.short
    })
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  }
}))

export function CategoryGrid({ onCategorySelect }: CategoryGridProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const categories: CategoryItem[] = [
    {
      title: t('Bible Stories'),
      icon: Bible,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      searchTerm: 'bible stories'
    },
    {
      title: t('Worship'),
      icon: Star2,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      searchTerm: 'worship'
    },
    {
      title: t('Teaching'),
      icon: Book,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      searchTerm: 'teaching'
    },
    {
      title: t('Youth'),
      icon: Play1,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      searchTerm: 'youth'
    },
    {
      title: t('Family'),
      icon: VideoOn,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      searchTerm: 'family'
    },
    {
      title: t('Holiday'),
      icon: Calendar1,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      searchTerm: 'holiday'
    }
  ]

  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 3, fontWeight: 600 }}
      >
        {t('Browse Categories')}
      </Typography>
      <Grid container spacing={4} rowSpacing={4}>
        {categories.map((category, index) => {
          const IconComponent = category.icon

          return (
            <Grid item xs={12} md={4} xl={3} key={index}>
              <CategoryTile
                onClick={() => onCategorySelect(category.searchTerm)}
                sx={{
                  background: category.gradient,
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 48,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  textAlign="center"
                  sx={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    lineHeight: 1.2
                  }}
                >
                  {category.title}
                </Typography>
              </CategoryTile>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
