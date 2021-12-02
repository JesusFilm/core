import { render, fireEvent } from '@testing-library/react'
import { SortBy } from '.'
import JourneySort from './JourneySort'

describe('JourneySort', () => {
  it('should sort by date created by default', () => {
    const {getByRole, getByText, getByDisplayValue} = render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
      />
    )

    const button = getByRole('button');
   // console.log(button);
    expect(button).toBeInTheDocument();

    // Check Chip label is "Sort By"
    expect(getByText('Sort By')).toBeInTheDocument();

    // fireEvent click Chip
    fireEvent.click(button);
    // Check radio option default value is "CREATED_AT"
    expect(getByDisplayValue('Date Created')).toHaveAttribute('checked', "");
  })

  it('should sort by name', () => {
    render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
        open={true}
      />
    )
    // fireEvent change to name
    // fireEvent click to apply button

    // Check handle submit is called correctly
    // Check Chip label has changed
  })

  it('should sort by date created', () => {
    render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
        open={true}
      />
    )
    // fireEvent change value to dateCreated - see that handleSubmit not called
    // fireEvent change to name then dateCreated
    // fireEvent click to apply button

    // Check handle submit is called correctly
    // Check Chip label has changed
  })

  it('should not set sort value on cancel button click', () => {
    render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
        open={true}
      />
    )
    // Check handle submit not called
    // Check Popover / Drawers not open
    // Check Chip label has changed
  })

  it('should not set sort value on close', () => {
    render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
        open={true}
      />
    )
    // Check handle submit is called correctly
    // Check Popover / Drawers not open
    // Check Chip label has changed
  })
})
