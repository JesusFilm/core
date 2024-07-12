import { Box, Card, Stack } from '@mui/material'
// import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'
import { StrategyCarouselItemProps } from '../StrategySection'

interface StrategyItemProps {
  item?: StrategyCarouselItemProps
  priority?: boolean
}

export function StrategyItem({
  item,
  priority
}: StrategyItemProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()
  return (
    // photo/image
    // title
    // description
    // url to point to wordpress?

    // object-id
    // posttitle
    // content (description)
    // image.thumbnail.url (image url)
    // permalink (link to use on nextLink to wrap)

    <Card
      data-testid="StrategyCard"
      aria-label="templateGalleryCard"
      tabIndex={0}
      sx={{
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        width: { xs: 210, md: 260, xl: 320 },
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
      {/* TODO: add nextlink to wrap component
      probably links to wordpress site */}
      {/* <NextLink href={}> */}

      <Stack
        justifyContent="center"
        alignItems="center"
        data-testid="ImageStack"
        sx={{
          position: 'relative',
          maxHeight: 160,
          aspectRatio: 2,
          overflow: 'hidden',
          borderRadius: 2,
          alignItems: 'center',
          backgroundColor: 'background.default'
        }}
      >
        {/* TODO: replace image src&alt with content from wordpress */}
        <Image
          data-testid="StrategyImage"
          className="MuiImageBackground-root"
          src="https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920"
          alt="random image from unsplash" // use title
          // width={320}
          // height={160}
          fill
          sizes={`(max-width: ${
            theme.breakpoints.values.md - 0.5
          }px) 130px, (max-width: ${
            theme.breakpoints.values.xl - 0.5
          }px) 180px, 280px`}
          style={{
            maxHeight: '160px',
            objectFit: 'cover'
          }}
        />
      </Stack>
      <Stack sx={{ px: 0, py: 3 }}>
        <Typography variant="subtitle2">{t(item?.title ?? '')}</Typography>
        <Box
          data-testid="BOXBOX"
          sx={{
            display: { xs: 'none', md: '-webkit-box' },
            height: '66px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3
          }}
        >
          <Typography
            variant="body1"
            sx={{
              my: 1
            }}
          >
            {t(item?.description ?? '')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: '-webkit-box', md: 'none' },
            height: '63px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3
          }}
        >
          <Typography
            variant="body2"
            sx={{
              my: 1
            }}
          >
            {t(item?.description ?? '')}
          </Typography>
        </Box>
      </Stack>
      {/* </NextLink> */}
    </Card>
  )
}
