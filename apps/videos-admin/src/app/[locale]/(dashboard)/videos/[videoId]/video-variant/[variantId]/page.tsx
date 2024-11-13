import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { ReactElement } from 'react'

import { Downloads } from '../../edit/Variants/Downloads'

export default function VideoVariantViewPage(): ReactElement {
  const params = useParams<{ videoId: string; locale: string }>()

  console.log(params)

  // const { data } = useQuery(GET_VIDEO_VARIANT, )

  return <div>{/* <Downloads downloads={variant.downloads} /> */}</div>
}
