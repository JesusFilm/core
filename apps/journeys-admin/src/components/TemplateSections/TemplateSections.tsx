import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useMemo, useState } from 'react'

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

  const [tagsFilter, setTagsFilter] = useState<string[]>()

  useEffect(() => {
    // add logic to update state with tags from filter component
    if (paramTags != null) {
      const tagsArray = Array.isArray(paramTags) ? paramTags : [paramTags]
      setTagsFilter(tagsArray)
    }
  }, [paramTags])

  function transformTagsValue(tagsFilter, childTags): TagDetailsProps[] {
    if (tagsFilter != null) {
      return tagsFilter.map((id) => ({
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
    () => transformTagsValue(tagsFilter, childTags),
    [tagsFilter, childTags]
  )

  return (
    <Stack spacing={8}>
      {tagsFilter != null ? (
        // replace with MostRelevantTemplates Component
        <>
          <Typography variant="h3">Tag Ids</Typography>
          {Array.isArray(tagsFilter) &&
            tagsFilter.map((tag, i) => (
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
          filtered={tagsFilter != null}
        />
      ))}
    </Stack>
  )
}
