import { HostAvatars } from '@core/journeys/ui/StepFooter/HostAvatars'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'

interface HostListItemProps {
  hostTitle: string
  hostLocation?: string
  avatarSrc1?: string
  avatarSrc2?: string
}

export function HostListItem({
  hostTitle,
  hostLocation,
  avatarSrc1,
  avatarSrc2
}: HostListItemProps): ReactElement {
  return (
    <ListItem disablePadding divider>
      <ListItemButton sx={{ px: 6, py: 5 }}>
        <Stack direction="row" sx={{ width: '100%' }}>
          <Box
            sx={{
              width: '92px',
              height: '48px',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              mr: 3
            }}
          >
            <HostAvatars
              size="large"
              avatarSrc1={avatarSrc1}
              avatarSrc2={avatarSrc2}
              hasPlaceholder
            />
          </Box>
          <Stack sx={{ minWidth: 0, justifyContent: 'center' }}>
            <Typography
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'secondary.dark'
              }}
            >
              {hostTitle}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'secondary.main'
              }}
            >
              {hostLocation}
            </Typography>
          </Stack>
        </Stack>
      </ListItemButton>
    </ListItem>
  )
}
