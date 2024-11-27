import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import unescape from 'lodash/unescape'
import { GetAdminVideo_AdminVideo_VideoDescriptions as VideoDescriptions } from '../../../../../../libs/useAdminVideo/useAdminVideo'

import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../_EditProvider'
import { TestEditProvider } from '../_EditProvider/TestEditProvider'

import { VideoView } from './VideoView'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

const mockUseParams = useParams as jest.MockedFunction<typeof mockUseParams>
const mockVideoDescriptions: VideoDescriptions =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['description']

describe('VideoView', () => {
  it('should get video details', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <EditProvider>
            <VideoView />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
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

  it('should toggle edit mode', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: false }}>
            <TestEditProvider />
            <VideoView />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByText('isEdit: true')).toBeInTheDocument()
  })

  it('should change tabs', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: false }}>
            <TestEditProvider />
            <VideoView />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('tab', { name: 'Children 3' }))
    expect(
      screen.getByRole('heading', { level: 6, name: '1. The Beginning' })
    ).toBeInTheDocument()
  })
})
