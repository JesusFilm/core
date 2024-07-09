import { Box, Card, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

export function StrategyItem(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()
  console.log(theme.breakpoints.values.xl)
  return (
    // photo
    // title
    // description

    <Card
      data-testid="StrategyCard"
      aria-label="templateGalleryCard"
      tabIndex={0}
      sx={{
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        width: { xs: 130, md: 180, xl: 240 },
        borderRadius: 2,
        boxShadow: 'none',
        p: 2,
        transition: (theme) => theme.transitions.create('background-color'),
        '& .MuiImageBackground-root': {
          transition: (theme) => theme.transitions.create('transform')
        },
        '&:hover': {
          backgroundColor: (theme) => theme.palette.grey[200],
          '& .MuiImageBackground-root': {
            transform: 'scale(1.05)'
          },
          '& .hoverImageEffects': {
            opacity: 0.3
          }
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: (theme) => theme.palette.primary.main
        }
      }}
    >
      {/* <NextLink href={}> */}
      {/* <Box
        sx={{
          height: 'inherit',
          color: 'inherit',
          textDecoration: 'none'
        }}
      > */}
      <Stack
        // justifyContent="center"
        // alignItems="center"
        sx={{
          position: 'relative',
          aspectRatio: 1,
          overflow: 'hidden',
          borderRadius: 2,
          alignItems: 'center',
          backgroundColor: 'background.default'
        }}
      >
        <Image
          data-testid="StrategyImage"
          className="MuiImageBackground-root"
          src="https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920"
          alt="random image from unsplash"
          fill
          //   width="460"
          //   height="460"
          sizes={`(max-width: ${
            theme.breakpoints.values.md - 0.5
          }px) 130px, (max-width: ${
            theme.breakpoints.values.xl - 0.5
          }px) 180px, 280px`}
          style={{
            objectFit: 'cover'
          }}
        />
      </Stack>
      {/* </Box> */}
      <Typography variant="h5">{t('Strategy title')}</Typography>
      <Typography>{t('Description')}</Typography>
      {/* </NextLink> */}
    </Card>
  )
}
