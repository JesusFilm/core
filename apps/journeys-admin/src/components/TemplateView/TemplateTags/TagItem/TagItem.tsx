import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import Calendar4Icon from '@core/shared/ui/icons/Calendar4'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Hash2Icon from '@core/shared/ui/icons/Hash2'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import SmileyNeutralIcon from '@core/shared/ui/icons/SmileyNeutral'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

function getParentTagIcon(id: string | null): ReactNode {
  switch (id) {
    case '8b7bd2e6-6eb5-4b48-a94f-4506e3b7b01d':
      return <UsersProfiles2Icon />
    case '36af9642-7176-4e94-b61a-95d0b57ad0bc':
      return <SmileyNeutralIcon />
    case '1673bb82-b776-446f-a6f6-d69d72ac2be6':
      return <MediaStrip1Icon />
    case '85471d1f-edc5-4477-a9cd-30af697749c4':
      return <Calendar4Icon />
    case '9b45707a-123a-4331-8722-65b010532531':
      return <Hash2Icon />
    default:
      return <Grid1Icon />
  }
}

interface TagItemProps {
  tag: Tag
}

export function TagItem({ tag }: TagItemProps): ReactElement {
  return (
    <Stack alignItems="center" gap={2} sx={{ minWidth: '99px', width: '99px' }}>
      {getParentTagIcon(tag.parentId)}
      <Typography variant="body2">{tag.name[0].value}</Typography>
    </Stack>
  )
}
