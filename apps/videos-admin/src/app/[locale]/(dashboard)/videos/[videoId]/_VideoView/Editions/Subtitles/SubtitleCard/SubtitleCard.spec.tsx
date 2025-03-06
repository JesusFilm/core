import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { SubtitleCard } from './SubtitleCard'

const mockEdition =
  useAdminVideoMock['result']?.['data']?.['adminVideo'].videoEditions[0]
const mockPrimarySubtitle = mockEdition.videoSubtitles[0]
const mockSubtitle = mockEdition.videoSubtitles[1]

describe('SubtitleCard', () => {
  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <SubtitleCard
          subtitle={mockSubtitle}
          onClick={jest.fn()}
          actions={{ view: jest.fn(), edit: jest.fn(), delete: jest.fn() }}
        />
      </NextIntlClientProvider>
    )

    expect(
      screen.getByText(mockSubtitle.language.name[0].value)
    ).toBeInTheDocument()
    expect(screen.getByTestId('ActionButton')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'more options' })
    ).toBeInTheDocument()
  })

  it('should render primary subtitle', () => {
    render(
      <NextIntlClientProvider locale="en">
        <SubtitleCard
          subtitle={mockPrimarySubtitle}
          onClick={jest.fn()}
          actions={{ view: jest.fn(), edit: jest.fn(), delete: jest.fn() }}
        />
      </NextIntlClientProvider>
    )
    expect(
      screen.getByText(
        mockPrimarySubtitle.language.name.find(({ primary }) => primary)?.value
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Primary')).toBeInTheDocument()
    expect(screen.getByTestId('ActionButton')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'more options' })
    ).toBeInTheDocument()
  })
})
