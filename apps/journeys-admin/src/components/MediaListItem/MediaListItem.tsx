import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import { NextImage } from '@core/shared/ui/NextImage'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'

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
  const twoLineDisplayProps = {
    display: '-webkit-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
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
                sx={{ ...twoLineDisplayProps, mb: 1 }}
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
                <Typography variant="subtitle1" sx={{ ...twoLineDisplayProps }}>
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
                  sx={{ ...twoLineDisplayProps }}
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
