import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'

import { useAdminVideoMock } from '../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { createStudyQuestionsMock } from '../@tabs/metadata/StudyQuestionsList/StudyQuestions.mock'
import { VideoView } from './VideoView'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

const mockUseParams = useParams as jest.MockedFunction<typeof mockUseParams>

describe('VideoView', () => {
  it('should get video details', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    // Use the imported mock for study questions
    const studyQuestionsMock = createStudyQuestionsMock('1_jf-0-0')

    render(
      <MockedProvider
        mocks={[{ ...useAdminVideoMock, result }, studyQuestionsMock]}
      >
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('JESUS')
    expect(screen.getAllByRole('img', { name: 'JESUS' })).toHaveLength(2)
    expect(screen.getByLabelText('snippet')).toHaveTextContent(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')
    expect(screen.getByRole('textbox', { name: 'Image Alt' })).toHaveValue(
      'JESUS'
    )
    expect(screen.getByLabelText('description')).toHaveTextContent(
      "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. God creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us. Before Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus. Jesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping. He scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings."
    )

    // Wait for the study questions to load
    await waitFor(() => {
      expect(screen.getByText('Study Questions')).toBeInTheDocument()
    })

    // Use a different assertion that matches the new format
    await waitFor(() => {
      const questionText = screen.getByText(
        "1. How is the sacrifice of Jesus part of God's plan?"
      )
      expect(questionText).toBeInTheDocument()
    })
  })

  it('should change tabs', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    // Use the imported mock for study questions
    const studyQuestionsMock = createStudyQuestionsMock('1_jf-0-0')

    render(
      <MockedProvider
        mocks={[{ ...useAdminVideoMock, result }, studyQuestionsMock]}
      >
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    fireEvent.click(screen.getByRole('tab', { name: 'Clips 3' }))
    expect(
      screen.getByRole('heading', { level: 6, name: '1. The Beginning' })
    ).toBeInTheDocument()
  })

  it('should not show video children if a video label is episodes', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'episodes'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('should  show video children if a video label is series', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'series'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(screen.getByRole('tab', { name: 'Episodes 3' })).toBeInTheDocument()
  })

  it('should  show video children if a video label is featureFilm', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'featureFilm'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(screen.getByRole('tab', { name: 'Clips 3' })).toBeInTheDocument()
  })

  it('should  show video children if a video label is collection', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'collection'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(screen.getByRole('tab', { name: 'Items 3' })).toBeInTheDocument()
  })

  it('should not show video children if a video label is segment', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'segment'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('should not show video children if a video label is shortFilm', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'shortFilm'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('should not show video children if a video label is trailer', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'trailer'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('should not show video children if a video label is behindTheScenes', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          label: 'behindTheScenes'
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('should render loading ui', async () => {
    render(
      <MockedProvider mocks={[]}>
        <VideoView />
      </MockedProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByTestId('PublishedChip')).not.toBeInTheDocument()
  })

  it('should show locked ui for locked video', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue({
      data: {
        adminVideo: {
          ...useAdminVideoMock.result?.['data']?.['adminVideo'],
          locked: true
        }
      }
    })

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <VideoView />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByText('Video is locked')).toBeInTheDocument()
    expect(
      screen.getByText('This video is currently locked to prevent edits')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Back to videos' })
    ).toBeInTheDocument()
  })
})
