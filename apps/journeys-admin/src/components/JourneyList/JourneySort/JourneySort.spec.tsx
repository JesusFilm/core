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
    const buttonSpan = button.querySelector('span');
    console.log("Button Span: ",buttonSpan?.textContent);
   // console.log(button);
    expect(button).toBeInTheDocument();

    // Check Chip label is "Sort By"
    expect(getByText('Sort By')).toBeInTheDocument();

    // fireEvent click Chip
    fireEvent.click(button);
    // Check radio option default value is "CREATED_AT"
    expect(getByDisplayValue('Date Created')).toBeChecked();

    const applyButton = getByText('Apply');
    expect(applyButton).toBeInTheDocument();
    fireEvent.click(applyButton);
    const buttonSpanNew = button.querySelector('span');
    console.log("Button Span after: ",buttonSpanNew?.textContent);
  })

  it('should sort by name', () => {
    const { getByLabelText, getByText} = render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
        open={true}
      />
    )
     const nameLabel = getByLabelText("Name");
     expect(nameLabel).not.toBeChecked();

    // fireEvent change to name
    fireEvent.click(nameLabel);
    expect(nameLabel).toBeChecked();
    // fireEvent click to apply button
    const applyButton = getByText('Apply');
    expect(applyButton).toBeInTheDocument();
    fireEvent.click(applyButton);


    // Check handle submit is called correctly

    // expect(JourneySort.handleSubmit).toHaveBeenCalled(); 
  
    // click cancel to close form
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    // Check Chip label has changed
    expect(getByText('Name')).toBeInTheDocument();

  })

  it('should sort by date created', () => {
    const { getByLabelText, getByText} = render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
        open={true}
      />
    )
    // fireEvent change value to dateCreated - see that handleSubmit not called
    const dateCreatedLabel = getByLabelText("Date Created");
    fireEvent.click(dateCreatedLabel);
    expect(dateCreatedLabel).toBeChecked();

    const nameLabel = getByLabelText("Name");
    expect(nameLabel).not.toBeChecked();
    // fireEvent change to name then dateCreated
    fireEvent.click(nameLabel);
    expect(nameLabel).toBeChecked();
    fireEvent.click(dateCreatedLabel);
    expect(dateCreatedLabel).toBeChecked();
    // fireEvent click to apply button
    const applyButton = getByText('Apply');
    fireEvent.click(applyButton);

    // Check handle submit is called correctly

    // click cancel to close form
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    // Check Chip label has changed
    expect(getByText('Date Created')).toBeInTheDocument();
  })

  it('should not set sort value on cancel button click', () => {
    const {getByText, getByLabelText} = render(
      <JourneySort
        sortBy={SortBy.UNDEFINED}
        setSortBy={() => {
          console.log()
        }}
        open={true}
      />
    )
    const dateCreatedLabel = getByLabelText("Date Created");
    fireEvent.click(dateCreatedLabel);
    const applyButton = getByText('Apply');
    fireEvent.click(applyButton);
    // Check handle submit not called
    // Check Popover / Drawers not open

    // click cancel
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    

    // Check Chip label is "Sort By"
     expect(getByText('Sort B', {selector: 'span'})).toBeInTheDocument();
  })

  it('should not set sort value on close', () => {
    const {getByText} = render(
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
     // get popover by id,  check it's aria-expanded
    // Check Chip label has not changed
    expect(getByText('Sort By', {selector: 'span'})).toBeInTheDocument();
  })
})
