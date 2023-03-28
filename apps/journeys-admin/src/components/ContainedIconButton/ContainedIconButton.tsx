import { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import Icon from '@mui/material/Icon'
import AddIcon from '@mui/icons-material/Add'
import { ImageThumbnail } from '../ImageThumbnail'

interface ContainedIconProps {
  thumbnailIcon?: ReactNode
  actionIcon?: ReactNode
  label: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  loading?: boolean
  handleClick: () => void
}

export function ContainedIconButton({
  thumbnailIcon,
  actionIcon = <AddIcon />,
  label,
  description,
  imageSrc,
  imageAlt,
  loading,
  handleClick
}: ContainedIconProps): ReactElement {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardActionArea onClick={handleClick}>
        <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
          <Box>
            <ImageThumbnail
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              icon={thumbnailIcon}
              loading={loading}
            />
          </Box>
          <Box flexGrow={1} minWidth={0}>
            <Typography
              variant="subtitle2"
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {label}
            </Typography>

            {description !== undefined && (
              <Typography
                variant="caption"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {description} &nbsp;
              </Typography>
            )}
          </Box>
          <Icon color="primary" padding-right="3">
            {actionIcon}
          </Icon>
        </Stack>
      </CardActionArea>
    </Card>
  )
}
