import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { TemplateGalleryMock } from './data'

import { TemplateGallery } from '.'

describe('TemplateGallery', () => {
  it('should render TemplateGallery', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={TemplateGalleryMock}>
        <TemplateGallery />
      </MockedProvider>
    )
    expect(
      getByRole('heading', { name: 'Journey Templates' })
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(getByRole('button', { name: 'English' })).toBeInTheDocument()
    )
    expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
  })
})
