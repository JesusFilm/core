import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

export interface StrategyItemProps {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
}

interface StrategyCardProps {
  item?: StrategyItemProps
  priority?: boolean
}

export function StrategyCard({
  item,
  priority
}: StrategyCardProps): ReactElement {
  const theme = useTheme()
  return (
    <Card
      data-testid="StrategyCard"
      aria-label="StrategyCard"
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
          data-testid="StrategyCardLink"
          sx={{
            height: 'inherit',
            color: 'inherit',
            textDecoration: 'none'
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
                className="MuiImageBackground-root"
                src={item?.imageUrl}
                alt={item?.title ?? ''}
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
