import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ActionCards } from './ActionCards'
import { ActionEditor } from './ActionEditor'

interface ActionDetailsProps {
  url?: string
}

export function ActionDetails({ url }: ActionDetailsProps): ReactElement {
  return (
    <>
      {url == null ? (
        <Stack gap={2} sx={{ p: 6 }}>
          <Typography variant="subtitle2">What are Possible Goals?</Typography>
          <Typography variant="body2" color="text.secondary">
            Depending on the link you provide for the actions, the target of
            your Journey will be determined automatically from the following
            list:
          </Typography>
          <Typography variant="subtitle2">Start a conversation</Typography>
          <Typography variant="body2" color="text.secondary">
            If the goal is to go any chat platform
          </Typography>
          <Typography variant="subtitle2">Visit a website</Typography>
          <Typography variant="body2" color="text.secondary">
            This could be your church or ministry website, or whatever you want
            to redirect the viewer to.
          </Typography>
          <Typography variant="subtitle2">Link to bible</Typography>
          <Typography variant="body2" color="text.secondary">
            If the target of the journey is to download the Bible
          </Typography>
        </Stack>
      ) : (
        <Stack gap={2} sx={{ p: 6 }}>
          <ActionEditor url={url} />
          <ActionCards url={url} />
        </Stack>
      )}
    </>
  )
}
