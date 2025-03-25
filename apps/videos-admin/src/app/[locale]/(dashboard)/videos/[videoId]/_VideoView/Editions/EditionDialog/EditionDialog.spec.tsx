import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { DialogAction } from '../../../../../../../../components/CrudDialog'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { EditionDialog } from './EditionDialog'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo.videoEditions[0]

describe('EditionDialog', () => {
  it('should not render when action is null', () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditionDialog edition={mockEdition} action={null} close={jest.fn()} />
      </NextIntlClientProvider>
    )

    expect(screen.queryByText('Create Edition')).not.toBeInTheDocument()
  })

  it('should render view edition dialog', () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditionDialog
          edition={mockEdition}
          action={DialogAction.VIEW}
          close={jest.fn()}
        />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('View Edition')).toBeInTheDocument()
  })

  it('should render create edition dialog', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionDialog
              edition={mockEdition}
              action={DialogAction.CREATE}
              close={jest.fn()}
            />
          </VideoProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Create Edition')).toBeInTheDocument()
  })

  it('should render edit edition dialog', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionDialog
              edition={mockEdition}
              action={DialogAction.EDIT}
              close={jest.fn()}
            />
          </VideoProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Edit Edition')).toBeInTheDocument()
  })

  it('should render delete edition dialog', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <EditionDialog
              edition={mockEdition}
              action={DialogAction.DELETE}
              close={jest.fn()}
            />
          </VideoProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Delete Edition')).toBeInTheDocument()
  })
})
