import { HostAvatars } from '@core/journeys/ui/StepFooter/HostAvatars'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { UpdateHost_hostUpdate as Host } from '../../../../../../../../../__generated__/UpdateHost'

interface HostListItemProps extends Omit<Host, 'teamId' | '__typename'> {
  onClick: (hostId: string) => void
}

export function HostListItem({
  id: hostId,
  title: hostTitle,
  location: hostLocation,
  src1: avatarSrc1,
  src2: avatarSrc2,
  onClick
}: HostListItemProps): ReactElement {
  const { journey } = useJourney()

  return (
    <ListItemButton
      sx={{ px: 6, py: 5 }}
      divider
      selected={journey?.host?.id === hostId}
      onClick={(): void => onClick(hostId)}
    >
      <Stack direction="row" sx={{ width: '100%' }}>
        <Box
          sx={{
            width: '85.2px',
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
  )
}
