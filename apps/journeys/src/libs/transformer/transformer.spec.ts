import transformer from '.'

describe('transformer', () => {
  it('should change flat array into tree successfully', () => {
    expect(transformer([
      {
        id: 'Root1'
      }, {
        id: 'Root2'
      }, {
        id: 'Question1',
        parent: { id: 'Root1' }
      }, {
        id: 'Option1',
        parent: { id: 'Question1' }
      }, {
        id: 'Option2',
        parent: { id: 'Question1' }
      }, {
        id: 'Question2',
        parent: { id: 'Root2' }
      }, {
        id: 'Option3',
        parent: { id: 'Question2' }
      }, {
        id: 'Option4',
        parent: { id: 'Question2' }
      }
    ])).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [],
                id: 'Option1',
                parent: { id: 'Question1' }
              },
              {
                children: [],
                id: 'Option2',
                parent: { id: 'Question1' }
              }
            ],
            id: 'Question1',
            parent: { id: 'Root1' }
          }],
        id: 'Root1'
      }, {
        children: [
          {
            children: [
              {
                children: [],
                id: 'Option3',
                parent: { id: 'Question2' }
              },
              {
                children: [],
                id: 'Option4',
                parent: { id: 'Question2' }
              }
            ],
            id: 'Question2',
            parent: { id: 'Root2' }
          }],
        id: 'Root2'
      }])
  })
})
