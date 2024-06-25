import { useEditor } from '@core/journeys/ui/EditorProvider'
import Facebook from '@core/shared/ui/icons/Facebook'
import ThumbsDown from '@core/shared/ui/icons/ThumbsDown'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import { Fade, Tooltip } from '@mui/material'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

function DataPoint({ value, Icon, tooltipTitle }) {
  return (
    <Tooltip
      title={tooltipTitle}
      placement="bottom"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -8]
              }
            }
          ]
        }
      }}
    >
      <Stack
        direction="row"
        spacing={3}
        sx={{
          px: 4,
          flex: 1,
          height: 48,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {Icon}
        <Typography variant="subtitle1">{value}</Typography>
      </Stack>
    </Tooltip>
  )
}

export function FooterAnalytics(props) {
  const {
    state: { selectedStep, showAnalytics, analytics }
  } = useEditor()

  const eventMap = analytics?.stepMap.get(selectedStep?.id ?? '')?.eventMap

  return (
    <Fade in={showAnalytics}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        sx={{ flex: 1 }}
      >
        <DataPoint
          Icon={<ThumbsUp />}
          value={eventMap?.get('footerThumbsUpButtonClick') ?? 0}
          tooltipTitle="Likes"
        />
        <DataPoint
          Icon={<ThumbsDown />}
          value={eventMap?.get('footerThumbsDownButtonClick') ?? 0}
          tooltipTitle="Dislikes"
        />
        <DataPoint
          Icon={<Facebook />}
          value={eventMap?.get('footerChatButtonClick') ?? 0}
          tooltipTitle="Widget clicks"
        />
      </Stack>
    </Fade>
  )
}
