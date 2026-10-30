import {
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  sectionCreateErrors,
  sectionCreateInputFields
} from './sectionCreateInput'
import { InputFieldBuilder } from './sectionStyleInput'

/** A field builder whose fields are the options they were declared with. */
function optionsBuilder(): InputFieldBuilder {
  return {
    id: (options: unknown) => options,
    int: (options: unknown) => options
  } as unknown as InputFieldBuilder
}

describe('sectionCreateErrors', () => {
  it('puts the given parentBlockId line into the errors text', () => {
    const errors = sectionCreateErrors('not a live column slot on the page.')

    expect(errors).toContain(
      '- BAD_USER_INPUT (field: `parentBlockId`): not a live column slot on the page.\n'
    )
    expect(errors).toMatch(/^Auth: campaign Update/)
  })
})

describe('sectionCreateInputFields', () => {
  it('describes pageId and parentBlockId with the defaults when none is given', () => {
    const fields = sectionCreateInputFields(optionsBuilder())

    expect(fields.pageId).toEqual({
      required: true,
      description: 'A page of the campaign.'
    })
    expect(fields.parentBlockId).toEqual({
      required: false,
      description: SECTION_PARENT_BLOCK_ID_DESCRIPTION
    })
  })

  it('describes pageId and parentBlockId with the given descriptions', () => {
    const fields = sectionCreateInputFields(optionsBuilder(), {
      pageId: 'The Region Page.',
      parentBlockId: 'Not taken.'
    })

    expect(fields.pageId).toEqual({
      required: true,
      description: 'The Region Page.'
    })
    expect(fields.parentBlockId).toEqual({
      required: false,
      description: 'Not taken.'
    })
  })
})
