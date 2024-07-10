import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { BaseReferrer } from '../BaseReferrer'

import { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'
import { MouseEvent, useState } from 'react'

export function OtherReferrer({ referrers }: { referrers: JourneyReferrer[] }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const visitorCount = referrers.reduce((acc, referrer) => {
    acc += referrer?.visitors ?? 0

    return acc
  }, 0)

  return (
    <>
      <Box
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={{
          width: 180,
          backgroundColor: 'background.paper',
          borderRadius: 50,
          boxShadow: 3
        }}
      >
        <BaseReferrer property="Other sources" visitors={visitorCount} />
      </Box>
      <Popover
        id="other-popper"
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: -8, horizontal: 'center' }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              width: 160
            }
          }
        }}
        sx={{ pointerEvents: 'none' }}
      >
        <Stack divider={<Divider flexItem />}>
          {referrers.map((referrer) => (
            <BaseReferrer key={referrer.property} {...referrer} />
          ))}
        </Stack>
      </Popover>
    </>
  )
}
