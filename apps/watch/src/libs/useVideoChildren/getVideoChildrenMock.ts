import { videos } from '../../components/Videos/__generated__/testData'

import { GET_VIDEO_CHILDREN } from './useVideoChildren'

export const getVideoChildrenMock = {
  request: {
    query: GET_VIDEO_CHILDREN,
    variables: {
      id: videos[0].variant?.slug
    }
  },
  result: {
    data: {
      video: {
        id: videos[0].id,
        children: videos
      }
    }
  }
}
