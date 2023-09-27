import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import { ReactElement, useMemo } from 'react'

import { GetTags } from '../../../../__generated__/GetTags'
import { useJourneysQuery } from '../../../libs/useJourneysQuery'
import { TemplateSection } from '../TemplateSection'

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name {
        value
        primary
      }
    }
  }
`

type TagDetailsProps = Array<{ id: string; name?: string }> | undefined

export function CategoryTemplates(): ReactElement {
  const router = useRouter()
  const queryTags = router.query.tags as string[]
  const { data: serverTags } = useQuery<GetTags>(GET_TAGS)

  function transformTagsValue(queryTags, serverTags): TagDetailsProps {
    if (queryTags != null) {
      const tagsArray = Array.isArray(queryTags) ? queryTags : [queryTags]
      return tagsArray.map((tag) => ({ id: tag }))
    }

    return serverTags?.tags.map((tag) => ({
      id: tag.id,
      name: tag.name.find(({ primary }) => primary)?.value
    }))
  }

  const tagDetails = useMemo(
    () => transformTagsValue(queryTags, serverTags),
    [queryTags, serverTags]
  )

  const { data } = useJourneysQuery({
    where: {
      template: true,
      orderByRecent: true,
      tagIds: tagDetails?.map((tag) => tag.id)
    }
  })

  function CategoryTemplate({ tagId, serverTagName, data }): ReactElement {
    const queryTagName = data?.journeys[0]?.tags
      .find((tag) => tag.id === tagId)
      ?.name.find(({ primary }) => primary)?.value

    return (
      <TemplateSection
        category={queryTags != null ? queryTagName : serverTagName}
        journeys={data?.journeys}
      />
    )
  }

  return (
    <>
      {tagDetails?.map(({ name, id }) => (
        <CategoryTemplate
          key={`category-${name as string}`}
          serverTagName={name}
          tagId={id}
          data={data}
        />
      ))}
    </>
  )
}
