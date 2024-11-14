import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { VideoInformation } from './VideoInfomation'

describe('VideoInformation', () => {
  it('should disable all fields if not in edit mode', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoInformation isEdit={false} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox', { name: 'Title' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Slug' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(screen.getByRole('checkbox', { name: 'No Index' })).toBeDisabled()
  })

  it('should show disabled save button in edit mode', () => {})

  it('should enable save button if a field has been changed', () => {})

  it('should update title, status, label and no index on submit', () => {})

  it('should require title field', () => {})
})
