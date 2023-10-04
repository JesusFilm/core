import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { useTagsQuery } from '../../libs/useTagsQuery'

import { CategoryTemplates } from './CategoryTemplates'
import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'
import { MostRelevantTemplates } from './MostRelevantTemplates'

interface TagDetailsProps {
  id: string
  name: string
}

export function TemplateSections(): ReactElement {
  const router = useRouter()
  const paramTags = router.query.tags
  const { childTags } = useTagsQuery()

  const [tagsFilter, setTagsFilter] = useState<string[]>([])

  useEffect(() => {
    // add logic to update state with tags from filter component
    if (paramTags != null) {
      const tagsArray = Array.isArray(paramTags) ? paramTags : [paramTags]
      setTagsFilter(tagsArray)
    }
  }, [paramTags])

  function transformTagsValue(tagsFilter, childTags): TagDetailsProps[] {
    if (tagsFilter.length > 0) {
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
      {tagsFilter.length > 0 ? (
        <MostRelevantTemplates />
      ) : (
        <FeaturedAndNewTemplates />
      )}
      {tags?.map(({ id, name }) => (
        <CategoryTemplates
          key={`category-${id}`}
          id={id}
          name={name}
          filtered={tagsFilter.length > 0}
        />
      ))}
    </Stack>
  )
}
