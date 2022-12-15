import { fireEvent, render } from '@testing-library/react'
import { VideoProvider } from '../../libs/videoContext'
import { VideoLabel } from '../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { SubtitleDialog } from './SubtitleDialog'

const onClose = jest.fn()

const video: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf-0-0',
  label: VideoLabel.featureFilm,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'JESUS' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. \n\nGod creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us.\n\nBefore Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus.\n\nJesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping.\n\nHe scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings."
    }
  ],
  studyQuestions: [
    {
      __typename: 'Translation',
      value: "How is the sacrifice of Jesus part of God's plan?"
    },
    {
      __typename: 'Translation',
      value:
        'How do the different groups of people respond to Jesus and His teachings?'
    },
    {
      __typename: 'Translation',
      value:
        'What are some of the miracles Jesus performed? How do they affect those people?'
    },
    {
      __typename: 'Translation',
      value: 'How do you respond to the life of Jesus?'
    }
  ],
  title: [{ __typename: 'Translation', value: 'JESUS' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf-0-0',
    duration: 7674,
    hls: 'https://arc.gt/j67rz',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'jesus/english',
    subtitle: [
      {
        __typename: 'Translation',
        language: {
          __typename: 'Language',
          bcp47: 'ar',
          id: '22658',
          name: [
            {
              __typename: 'Translation',
              value: ' اللغة العربية',
              primary: false
            },
            {
              __typename: 'Translation',
              value: 'Arabic, Modern Standard',
              primary: true
            }
          ]
        },
        value:
          'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
      }
    ]
  },
  slug: 'jesus',
  children: []
}

let playerRef

describe('SubtitleDialog', () => {
  it('closes the modal on cancel icon click', () => {
    const { getByTestId } = render(
      <VideoProvider value={{ content: video }}>
        <SubtitleDialog onClose={onClose} open playerRef={playerRef} />
      </VideoProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })
})
