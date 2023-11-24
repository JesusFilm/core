import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { SxProps, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

interface MediaListItemLoadingProps {
  image?: string
  title?: string
  description?: string
  loading: true
  overline?: string
  href?: string
}

interface MediaListItemLoadedProps {
  image?: string
  title: string
  description?: string
  loading?: false
  overline?: string
  href: string
}

type MediaListItemProps = MediaListItemLoadingProps | MediaListItemLoadedProps

export function MediaListItem({
  image,
  title,
  description,
  loading,
  overline,
  href
}: MediaListItemProps): ReactElement {
  const theme = useTheme()
  // TODO: Replace fade with `line-clamp` with ellipsis when line-clamp supported
  const fadeOverflowText = (variant: string): SxProps => {
    return {
      mb: 1,
      position: 'relative',
      maxHeight: `calc(${theme.typography[variant].lineHeight as string} * 2)`,
      overflow: 'hidden',
      '::before': {
        content: "''",
        textAlign: 'right',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '30%',
        mt: theme.typography[variant].lineHeight as string,
        background: `linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 90%)`,
        height: theme.typography[variant].lineHeight as string
      }
    }
  }
  const faceOnButtonHoverFix = {
    transition: 'none',
    '&:hover': {
      transition: 'none',
      '.overflow-text': {
        '::before': {
          background: `linear-gradient(to right, rgba(245, 245, 245, 0), rgba(245, 245, 245, 1) 90%)`
        }
      }
    }
  }

  return (
    <NextLink href={href ?? ''} passHref legacyBehavior prefetch={false}>
      <ListItemButton
        disabled={loading}
        sx={{
          ...faceOnButtonHoverFix,
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 6
        }}
        data-testid="JourneysAdminMediaListItem"
      >
        <Stack direction="row" spacing={4} alignItems="center">
          <Box
            sx={{
              width: 79,
              height: 79,
              position: 'relative',
              flexShrink: 0,
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            {loading === true ? (
              <Skeleton variant="rectangular" height="100%" />
            ) : image != null ? (
              <NextImage
                src={image}
                alt={title}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'background.default',
                  height: '100%'
                }}
              >
                <InsertPhotoRoundedIcon />
              </Box>
            )}
          </Box>
          <Stack flexGrow={1} sx={{ overflow: 'hidden' }}>
            {loading === true ? (
              <Skeleton
                variant="text"
                width={100}
                sx={{ mb: 1, height: theme.typography.overline.lineHeight }}
              />
            ) : (
              overline != null && (
                <Typography
                  variant="overline"
                  color="secondary.light"
                  className="overflow-text"
                  sx={{ ...fadeOverflowText('overline'), mt: 2 }}
                >
                  {overline}
                </Typography>
              )
            )}

            <ListItemText
              primary={
                loading === true ? (
                  <Skeleton
                    variant="rectangular"
                    width={150}
                    sx={{
                      mt: 0.5,
                      borderRadius: 1,
                      fontSize: theme.typography.subtitle1.fontSize
                    }}
                  />
                ) : (
                  <Typography
                    variant="subtitle1"
                    className="overflow-text"
                    sx={{ ...fadeOverflowText('subtitle1') }}
                  >
                    {title}
                  </Typography>
                )
              }
              secondary={
                loading === true ? (
                  <Skeleton
                    variant="text"
                    width={125}
                    sx={{ mt: 1, fontSize: theme.typography.body2.lineHeight }}
                  />
                ) : (
                  description != null && (
                    <Typography
                      variant="body2"
                      color="secondary.light"
                      className="overflow-text"
                      sx={{ ...fadeOverflowText('body2') }}
                    >
                      {description}
                    </Typography>
                  )
                )
              }
              sx={{ mt: 0 }}
            />
          </Stack>
        </Stack>
      </ListItemButton>
    </NextLink>
  )
}
