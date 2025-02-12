import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VideoView } from './VideoView'

const baseVideo = useAdminVideoMock.result?.['data']?.['adminVideo']

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: jest.fn()
}))

describe('VideoView', () => {
  it('should render video details', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={baseVideo} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(
      screen.getByRole('heading', { level: 4, name: 'JESUS' })
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')
    expect(screen.getByRole('textbox', { name: 'Image Alt' })).toHaveValue(
      'JESUS'
    )
    expect(screen.getByRole('img', { name: 'JESUS' })).toBeInTheDocument()
    expect(screen.getByLabelText('snippet')).toHaveTextContent(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )
    expect(screen.getByLabelText('description')).toHaveTextContent(
      "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. God creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us. Before Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus. Jesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping. He scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings."
    )
    expect(
      screen.getByRole('heading', {
        level: 6,
        name: "1. How is the sacrifice of Jesus part of God's plan?"
      })
    ).toBeInTheDocument()
  })

  it('should change tabs', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={baseVideo} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    const user = userEvent.setup()

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    await user.click(screen.getByRole('tab', { name: 'Clips 3' }))
    expect(
      screen.getByRole('heading', { level: 6, name: '1. The Beginning' })
    ).toBeInTheDocument()
  })

  it('should not show video children if a video label is episodes', () => {
    const video = {
      ...baseVideo,
      label: 'episodes'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('should show video children if a video label is series', () => {
    const video = {
      ...baseVideo,
      label: 'series'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Episodes 3' })).toBeInTheDocument()
  })

  it('should show video children if a video label is featureFilm', () => {
    const video = {
      ...baseVideo,
      label: 'featureFilm'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Clips 3' })).toBeInTheDocument()
  })

  it('should show video children if a video label is collection', () => {
    const video = {
      ...baseVideo,
      label: 'collection'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Items 3' })).toBeInTheDocument()
  })

  it('should not show video children if a video label is segment', () => {
    const video = {
      ...baseVideo,
      label: 'segment'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('should not show video children if a video label is shortFilm', () => {
    const video = {
      ...baseVideo,
      label: 'shortFilm'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('should not show video children if a video label is trailer', () => {
    const video = {
      ...baseVideo,
      label: 'trailer'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('should not show video children if a video label is behindTheScenes', () => {
    const video = {
      ...baseVideo,
      label: 'behindTheScenes'
    }

    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoView video={video} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})
