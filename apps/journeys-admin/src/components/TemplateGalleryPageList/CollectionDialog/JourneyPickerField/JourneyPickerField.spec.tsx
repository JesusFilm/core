import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../../../../../test/i18n'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'

import { JourneyPickerField } from './JourneyPickerField'

const journey = (id: string, title: string): Journey =>
  ({
    __typename: 'Journey',
    id,
    title,
    primaryImageBlock: null
  }) as unknown as Journey

describe('JourneyPickerField', () => {
  it('renders chips in user-pick order, not source-pool order', () => {
    const pool: Journey[] = [
      journey('a', 'Alpha'),
      journey('b', 'Bravo'),
      journey('c', 'Charlie')
    ]

    render(
      <JourneyPickerField
        availableJourneys={pool}
        journeyIds={['c', 'a']}
        onChange={jest.fn()}
      />
    )
    const chips = screen.getAllByRole('button', { name: /Alpha|Charlie/ })
    expect(chips.map((chip) => chip.textContent)).toEqual(['Charlie', 'Alpha'])
  })

  it('shows the placeholder copy when no journeys are selected', () => {
    render(
      <JourneyPickerField
        availableJourneys={[journey('a', 'Alpha')]}
        journeyIds={[]}
        onChange={jest.fn()}
      />
    )
    expect(
      screen.getByPlaceholderText('Select templates to include')
    ).toBeInTheDocument()
  })

  it('fires onChange with the new id list when an option is picked, and onTouch once', async () => {
    const onChange = jest.fn()
    const onTouch = jest.fn()
    render(
      <JourneyPickerField
        availableJourneys={[journey('a', 'Alpha'), journey('b', 'Bravo')]}
        journeyIds={[]}
        onChange={onChange}
        onTouch={onTouch}
      />
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Bravo' }))
    expect(onChange).toHaveBeenCalledWith(['b'])
    expect(onTouch).toHaveBeenCalledTimes(1)
  })

  it('renders the disabled helper text when disabled is true', () => {
    render(
      <JourneyPickerField
        availableJourneys={[journey('a', 'Alpha')]}
        journeyIds={['a']}
        onChange={jest.fn()}
        disabled
      />
    )
    expect(
      screen.getByText('Unpublish to change templates in this collection.')
    ).toBeInTheDocument()
  })

  it('uses the override disabledHelperText when provided', () => {
    render(
      <JourneyPickerField
        availableJourneys={[journey('a', 'Alpha')]}
        journeyIds={['a']}
        onChange={jest.fn()}
        disabled
        disabledHelperText="Locked while syncing."
      />
    )
    expect(screen.getByText('Locked while syncing.')).toBeInTheDocument()
  })

  it('silently drops journey ids that are not in the available pool', () => {
    render(
      <JourneyPickerField
        availableJourneys={[journey('a', 'Alpha')]}
        journeyIds={['a', 'missing-id']}
        onChange={jest.fn()}
      />
    )
    // Only 'Alpha' chip renders; the orphan id is filtered out.
    const region = screen.getByRole('combobox').closest('div') as HTMLElement
    const chips = within(region).queryAllByRole('button', { name: 'Alpha' })
    expect(chips).toHaveLength(1)
  })
})
