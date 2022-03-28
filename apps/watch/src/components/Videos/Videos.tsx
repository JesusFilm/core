import { gql } from '@apollo/client'
import { ReactElement } from 'react'
import { VideoList } from './VideoList/VideoList'

export function Videos(): ReactElement {
  return <VideoList />
}
