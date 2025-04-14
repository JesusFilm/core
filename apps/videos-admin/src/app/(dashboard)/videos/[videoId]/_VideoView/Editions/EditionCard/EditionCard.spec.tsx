import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { EditionCard } from './EditionCard'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo.videoEditions[0]

describe('EditionCard', () => {
  it('should render', () => {
    render(
      <EditionCard
        edition={mockEdition}
        onClick={jest.fn()}
        actions={{
          view: jest.fn(),
          edit: jest.fn(),
          delete: jest.fn()
        }}
      />
    )

    expect(screen.getByText(mockEdition.name)).toBeInTheDocument()
    expect(
      screen.getByText(`${mockEdition.videoSubtitles.length} subtitles`)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /more options/i })
    ).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const onClick = jest.fn()
    render(
      <EditionCard
        edition={mockEdition}
        onClick={onClick}
        actions={{
          view: jest.fn(),
          edit: jest.fn(),
          delete: jest.fn()
        }}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByTestId('EditionCard'))
    expect(onClick).toHaveBeenCalled()
  })

  it('should emit action callbacks', async () => {
    const viewFn = jest.fn()
    const editFn = jest.fn()
    const deleteFn = jest.fn()

    render(
      <EditionCard
        edition={{ ...mockEdition, videoSubtitles: [] }}
        onClick={jest.fn()}
        actions={{
          view: viewFn,
          edit: editFn,
          delete: deleteFn
        }}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /more options/i }))

    await user.click(screen.getByRole('menuitem', { name: 'View' }))
    expect(viewFn).toHaveBeenCalled()

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(editFn).toHaveBeenCalled()

    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(deleteFn).toHaveBeenCalled()
  })

  it('should not show delete option if there are subtitles', async () => {
    render(
      <EditionCard
        edition={mockEdition}
        onClick={jest.fn()}
        actions={{
          view: jest.fn(),
          edit: jest.fn(),
          delete: jest.fn()
        }}
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /more options/i }))

    expect(screen.getByRole('menuitem', { name: 'View' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Delete' })
    ).not.toBeInTheDocument()
  })
})
