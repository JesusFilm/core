import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { TagItem } from './TagItem'

interface TemplateTagsProps {
  tags?: Tag[]
}

export function TemplateTags({ tags }: TemplateTagsProps): ReactElement {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={14}
      sx={{
        height: '84px',
        py: 2,
        overflowX: 'auto',
        '::-webkit-scrollbar': {
          width: '0px',
          background: 'transparent'
        }
      }}
    >
      {tags?.map((tag, index) => (
        <>
          <TagItem key={tag.id} tag={tag} />
          {index < tags.length - 1 && (
            <Divider orientation="vertical" sx={{ height: '48px' }} />
          )}
        </>
      ))}
    </Stack>
  )
}
