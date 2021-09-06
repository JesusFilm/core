import React, { ReactElement } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { Container } from '@material-ui/core'
import { RadioQuestion } from '../RadioQuestion/'

const data = {
  __typename: 'RadioQuestion',
  id: 'MoreQuestions',
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  variant: 'light',
  parent: {
    id: 'Step1'
  },
  children: [
    {
      __typename: 'RadioOption',
      id: 'NestedOptions',
      label: 'Chat Privately',
      parent: {
        id: 'MoreQuestions'
      }
    },
    {
      __typename: 'RadioOption',
      id: 'NestedOptions2',
      label: 'Get a bible',
      parent: {
        id: 'MoreQuestions'
      }
    },
    {
      __typename: 'RadioOption',
      id: 'NestedOptions3',
      label: 'Watch more vidoes about Jesus',
      parent: {
        id: 'MoreQuestions'
      }
    },
    {
      __typename: 'RadioOption',
      id: 'NestedOptions4',
      label: 'Ask a question',
      parent: {
        id: 'MoreQuestions'
      }
    }
  ]
}

export const Video = () => {
  const videoJsOptions = {
    autoplay: 'muted',
    controls: true,
    volume: 0,
    fullscreenToggle: true,
    fullscreenOnDoubleClick: true,
    sources: [
      {
        src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
      }
    ]
  }

  return (
    <Container>
      <VideoPlayer options={videoJsOptions}>
        <RadioQuestion {...data} />
      </VideoPlayer>
    </Container>
  )
}
