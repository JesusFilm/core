import { render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { VideoEditionChip } from '.'

describe('VideoEditionChip', () => {
  it('should render the edition name in a chip', () => {
    render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <VideoEditionChip editionName="Standard Edition" />
      </NextIntlClientProvider>
    )

    const editionField = screen.getByTestId('VideoEditionChip')
    expect(editionField).toBeInTheDocument()

    const chip = within(editionField).getByText('Standard Edition')
    expect(chip).toBeInTheDocument()

    const chipElement = chip.closest('[aria-label="Edition"]')
    expect(chipElement).toBeInTheDocument()
  })

  it('should have the correct label', () => {
    render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <VideoEditionChip editionName="Standard Edition" />
      </NextIntlClientProvider>
    )

    const editionField = screen.getByTestId('VideoEditionChip')
    const label = within(editionField).getByText('Edition')
    expect(label).toBeInTheDocument()
  })
})
