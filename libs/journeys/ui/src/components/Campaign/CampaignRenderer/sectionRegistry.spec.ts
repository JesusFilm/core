import { expectTypeOf } from 'vitest'

import {
  PAGE_SECTION_TYPENAMES,
  type PageSectionTypename
} from '../libs/campaignBlockGrammar'

import { sectionRegistry } from './sectionRegistry'

describe('sectionRegistry', () => {
  it('has exactly the 11 page section keys, in grammar order', () => {
    expectTypeOf<
      keyof typeof sectionRegistry
    >().toEqualTypeOf<PageSectionTypename>()
    expect(Object.keys(sectionRegistry)).toEqual([...PAGE_SECTION_TYPENAMES])
  })
})
