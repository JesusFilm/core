import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement, useMemo } from 'react'

import { useTagsQuery } from '../../libs/useTagsQuery/useTagsQuery'

import { CategoryTemplates } from './CategoryTemplates'
import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'

interface TagDetailsProps {
  id: string
  name: string
}

export function TemplateSections(): ReactElement {
  const router = useRouter()
  const paramTags = router.query.tags
  const { childTags } = useTagsQuery()

  console.log(paramTags != null)

  function transformTagsValue(paramTags, childTags): TagDetailsProps[] {
    if (paramTags != null) {
      const tagsArray = Array.isArray(paramTags) ? paramTags : [paramTags]
      return tagsArray.map((id) => ({
        id,
        name: childTags
          ?.find((tag) => tag.id === id)
          .name.find(({ primary }) => primary)?.value
      }))
    }

    return childTags?.map((tag) => ({
      id: tag.id,
      name: tag.name.find(({ primary }) => primary)?.value
    }))
  }

  const tags = useMemo(
    () => transformTagsValue(paramTags, childTags),
    [paramTags, childTags]
  )

  return (
    <Stack spacing={8}>
      {paramTags != null ? (
        // replace with MostRelevantTemplates Component
        <>
          <Typography variant="h3">Tag Ids</Typography>
          {Array.isArray(paramTags) &&
            paramTags.map((tag, i) => (
              <Typography key={i} variant="h4">
                {tag}
              </Typography>
            ))}
        </>
      ) : (
        <FeaturedAndNewTemplates />
      )}
      {tags?.map(({ id, name }) => (
        <CategoryTemplates
          key={`category-${id}`}
          id={id}
          name={name}
          filtered={paramTags != null}
        />
      ))}
    </Stack>
  )
}
