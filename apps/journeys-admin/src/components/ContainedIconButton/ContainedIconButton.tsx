import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Icon from '@mui/material/Icon'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import { ImageThumbnail } from '../ImageThumbnail'

interface ContainedIconProps {
  thumbnailIcon?: ReactNode
  actionIcon?: ReactNode
  label: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}

export function ContainedIconButton({
  thumbnailIcon,
  actionIcon = <AddIcon />,
  label,
  description,
  imageSrc,
  imageAlt,
  disabled = false,
  loading = false,
  onClick
}: ContainedIconProps): ReactElement {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardActionArea onClick={onClick} disabled={disabled ?? loading}>
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
            <Typography variant="subtitle2">{label}</Typography>
            {description != null && (
              <Typography variant="caption">{description}</Typography>
            )}
          </Box>
          <Icon
            color={disabled ?? loading ? 'disabled' : 'primary'}
            sx={{ pr: 8 }}
          >
            {actionIcon}
          </Icon>
        </Stack>
      </CardActionArea>
    </Card>
  )
}
