import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantCard } from './VariantCard'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const variant: GetAdminVideoVariant =
  useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0]

describe('VariantCard', () => {
  it('should display language and languageId of variant', () => {
    const onClick = jest.fn()
    render(<VariantCard variant={variant} onClick={onClick} />)

    expect(screen.getByText('Munukutuba')).toBeInTheDocument()
  })

  it('should handle card click', async () => {
    const onClick = jest.fn()
    render(<VariantCard variant={variant} onClick={onClick} />)

    fireEvent.click(screen.getByRole('listitem'))
    await waitFor(() =>
      expect(onClick).toHaveBeenCalledWith({
        downloads: [
          {
            height: 360,
            id: 'download-id',
            quality: 'high',
            size: 2248469346,
            url: 'https://arc.gt/4d9ez',
            width: 640
          },
          {
            height: 180,
            id: 'de3c0487-1ab5-488e-b4f0-03001e21579c',
            quality: 'low',
            size: 197621170,
            url: 'https://arc.gt/f4rc6',
            width: 320
          }
        ],
        id: '1_4334-jf-0-0',
        language: {
          id: '4334',
          name: [{ primary: true, value: 'Munukutuba' }],
          slug: 'munukutuba'
        },
        slug: 'jesus/munukutuba',
        hls: 'https://arc.gt/hls/munukutuba/master.m3u8',
        videoEdition: {
          id: 'edition.id',
          name: 'base'
        },
        videoId: '1_jf-0-0'
      })
    )
  })

  it('renders delete button when onDelete is provided', () => {
    const handleClick = jest.fn()
    const handleDelete = jest.fn()

    render(
      <VariantCard
        variant={variant}
        onClick={handleClick}
        onDelete={handleDelete}
      />
    )

    // Check if delete button is rendered
    const deleteButton = screen.getByLabelText('delete variant')
    expect(deleteButton).toBeInTheDocument()
  })

  it('does not render delete button when onDelete is not provided', () => {
    const handleClick = jest.fn()

    render(<VariantCard variant={variant} onClick={handleClick} />)

    // Check if delete button is not rendered
    const deleteButton = screen.queryByLabelText('delete variant')
    expect(deleteButton).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const handleClick = jest.fn()
    const handleDelete = jest.fn()

    render(
      <VariantCard
        variant={variant}
        onClick={handleClick}
        onDelete={handleDelete}
      />
    )

    const deleteButton = screen.getByLabelText('delete variant')
    fireEvent.click(deleteButton)

    expect(handleDelete).toHaveBeenCalled()

    expect(handleClick).not.toHaveBeenCalled()
  })
})
