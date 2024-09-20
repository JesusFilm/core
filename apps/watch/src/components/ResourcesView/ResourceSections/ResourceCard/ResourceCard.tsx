import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'
import { useHits } from 'react-instantsearch'

export interface ResourceItemProps {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
}

interface ResourceCardProps {
  item?: ResourceItemProps
  priority?: boolean
}

export function ResourceCard({
  item,
  priority = true
}: ResourceCardProps): ReactElement {
  const { hits, sendEvent } = useHits()
  const hit = hits.filter((hit) => hit.objectID === item?.id)

  return (
    <Card
      data-testid="ResourceCard"
      aria-label="ResourceCard"
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
      <NextLink href={item?.link ?? ''} passHref legacyBehavior>
        <Box
          component="a"
          tabIndex={-1}
          data-testid="ResourceCardLink"
          sx={{
            height: 'inherit',
            color: 'inherit',
            textDecoration: 'none'
          }}
          onClick={(event) => {
            event.stopPropagation()
            sendEvent('click', hit, 'Resource Clicked')
          }}
        >
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{
              position: 'relative',
              maxHeight: 160,
              aspectRatio: 2,
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: 'background.default'
            }}
          >
            {item?.imageUrl != null ? (
              <Image
                rel={priority ? 'preload' : undefined}
                priority={priority}
                className="MuiImageBackground-root"
                src={item?.imageUrl}
                alt={item?.title ?? ''}
                fill
                objectFit="cover"
              />
            ) : (
              <InsertPhotoRoundedIcon className="MuiImageBackground-root" />
            )}
          </Stack>
          <Stack sx={{ px: 0, py: 3 }}>
            <Typography variant="subtitle2">{item?.title ?? ''}</Typography>
            <Box
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
                {item?.description ?? ''}
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
                {item?.description ?? ''}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </NextLink>
    </Card>
  )
}
