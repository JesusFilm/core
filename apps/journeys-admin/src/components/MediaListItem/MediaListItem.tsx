import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import { NextImage } from '@core/shared/ui/NextImage'
import Skeleton from '@mui/material/Skeleton'
import { SxProps, useTheme } from '@mui/material/styles'

interface MediaListItemProps {
  id: string
  image: string
  title: string
  description: string
  loading?: boolean
  overline?: string
  imagePosition?: 'start' | 'end'
  duration?: string
  onClick: () => void
}

export function MediaListItem({
  image,
  title,
  description,
  loading = false,
  overline,
  imagePosition = 'start',
  duration,
  onClick
}: MediaListItemProps): ReactElement {
  const theme = useTheme()
  const twoLineDisplayProps = (variant: string): SxProps => {
    return {
      mb: 1,
      position: 'relative',
      maxHeight: `${
        +(theme.typography[variant].lineHeight as string).slice(0, -2) * 2
      }px`,
      overflow: 'hidden',
      '::before': {
        content: "''",
        textAlign: 'right',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '30%',
        mt: theme.typography[variant].lineHeight as string,
        height: theme.typography[variant].lineHeight as string,
        background: `linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 90%)`
      }
    }
  }

  return (
    <ListItemButton onClick={onClick} disabled={loading}>
      <Stack
        direction={imagePosition === 'start' ? 'row' : 'row-reverse'}
        spacing={4}
        alignItems="center"
        sx={{ width: '100%' }}
      >
        {loading ? (
          <Skeleton
            data-testid="image-placeholder"
            variant="rectangular"
            height={79}
            width={79}
            sx={{ borderRadius: 2 }}
          />
        ) : (
          <Stack>
            <NextImage
              src={image}
              height={79}
              width={79}
              layout="fixed"
              objectFit="cover"
              style={{
                borderRadius: 8
              }}
            />
            {duration != null && (
              <Stack
                sx={{
                  position: 'absolute',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  height: 79,
                  width: 79,
                  borderRadius: 2,
                  mr: 2
                }}
              >
                <Typography
                  component="div"
                  variant="caption"
                  sx={{
                    color: 'background.paper',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    px: 1,
                    m: 1,
                    borderRadius: 2
                  }}
                >
                  {duration}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
        <Stack flexGrow={1}>
          {overline != null &&
            (loading ? (
              <Skeleton
                variant="text"
                width={10.5 * overline.length}
                sx={{ mb: 1, height: theme.typography.overline.lineHeight }}
              />
            ) : (
              <Typography
                variant="overline"
                color="secondary.light"
                sx={{ ...twoLineDisplayProps('overline') }}
              >
                {overline}
              </Typography>
            ))}

          <ListItemText
            primary={
              loading ? (
                <Skeleton
                  variant="rectangular"
                  width={9.5 * title.length}
                  sx={{
                    mt: 0.5,
                    borderRadius: 1,
                    fontSize: theme.typography.subtitle1.fontSize
                  }}
                />
              ) : (
                <Typography
                  variant="subtitle1"
                  sx={{ ...twoLineDisplayProps('subtitle1') }}
                >
                  {title}
                </Typography>
              )
            }
            secondary={
              loading ? (
                <Skeleton
                  variant="text"
                  width={6 * description.length}
                  sx={{ mt: 1, fontSize: theme.typography.body2.lineHeight }}
                />
              ) : (
                <Typography
                  variant="body2"
                  color="secondary.light"
                  sx={{ ...twoLineDisplayProps('body2') }}
                >
                  {description}
                </Typography>
              )
            }
            sx={{ mt: 0 }}
          />
        </Stack>
      </Stack>
    </ListItemButton>
  )
}
