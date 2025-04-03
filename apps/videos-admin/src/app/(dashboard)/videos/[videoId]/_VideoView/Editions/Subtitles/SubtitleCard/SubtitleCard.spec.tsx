import { render, screen, waitFor } from '@testing-library/react'

import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { SubtitleCard } from './SubtitleCard'

const mockEdition =
  useAdminVideoMock['result']?.['data']?.['adminVideo'].videoEditions[0]
const mockPrimarySubtitle = mockEdition.videoSubtitles[0]

describe('SubtitleCard', () => {
  it('should render primary subtitle', () => {
    render(
      
        <SubtitleCard
          subtitle={mockPrimarySubtitle}
          onClick={jest.fn()}
          actions={{ view: jest.fn(), edit: jest.fn(), delete: jest.fn() }}
        />
      
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
