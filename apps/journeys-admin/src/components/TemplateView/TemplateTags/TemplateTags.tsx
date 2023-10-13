import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement, useMemo } from 'react'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import Laptop1Icon from '@core/shared/ui/icons/Laptop1'

import { useTagsQuery } from '../../../libs/useTagsQuery'

import { getParentTagsWithIcon } from './getParentTagsWithIcon'
import { TagItem } from './TagItem'

interface TemplateTagsProps {
  tags?: Tag[]
}

export function TemplateTags({ tags }: TemplateTagsProps): ReactElement {
  const { parentTags } = useTagsQuery()
  const parentTagsWithIcons = useMemo(
    () => getParentTagsWithIcon(parentTags),
    [parentTags]
  )

  const tagItems = tags?.map((tag) => {
    return {
      id: tag.id,
      name: tag.name[0].value,
      icon: parentTagsWithIcons.find(
        (parentTag) => parentTag.id === tag.parentId
      )?.icon ?? <Laptop1Icon />
    }
  })

  return tagItems != null && tagItems?.length > 0 ? (
    <Stack
      data-testid="TemplateTags"
      direction="row"
      alignItems="center"
      gap={14}
      sx={{
        height: '84px',
        py: 2
      }}
    >
      {tagItems?.map(({ id, name, icon }, index) => (
        <>
          <TagItem key={id} name={name} icon={icon} />
          {index < tagItems.length - 1 && (
            <Divider orientation="vertical" sx={{ height: '48px' }} />
          )}
        </>
      ))}
    </Stack>
  ) : (
    <></>
  )
}
