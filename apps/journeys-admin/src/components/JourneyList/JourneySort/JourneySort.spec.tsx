import { render } from '@testing-library/react'
import { SortBy } from '.'
import JourneySort from './JourneySort'

describe('JourneySort', () => {
  it('should sort by date created by default', () => {
    render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
      />
    )

    // Check Chip label is "Sort By"
    // fireEvent click Chip
    // Check radio option default value is "CREATED_AT"
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
