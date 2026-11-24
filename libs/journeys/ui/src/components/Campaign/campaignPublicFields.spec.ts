import { FieldNode, Kind, visit } from 'graphql'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from './campaignPublicFields'

function languageIdArgumentOf(field: FieldNode): string | undefined {
  const argument = field.arguments?.find(
    (candidate) => candidate.name.value === 'languageId'
  )
  if (argument?.value.kind !== Kind.VARIABLE) return undefined
  return argument.value.name.value
}

/** The `languageId` each `variant` field passes, keyed by the path of fields above it. */
function variantLanguageArguments(): Record<string, string | undefined> {
  const path: string[] = []
  const found: Record<string, string | undefined> = {}
  visit(CAMPAIGN_PUBLIC_BLOCK_FIELDS, {
    Field: {
      enter(field) {
        path.push(field.name.value)
        if (field.name.value === 'variant')
          found[path.join('.')] = languageIdArgumentOf(field)
      },
      leave() {
        path.pop()
      }
    }
  })
  return found
}

describe('CAMPAIGN_PUBLIC_BLOCK_FIELDS', () => {
  it('reads an expanded carousel Video and its children in the Page Language', () => {
    const variants = variantLanguageArguments()

    expect(variants['video.variant']).toBe('languageId')
    expect(variants['video.children.variant']).toBe('languageId')
  })
})
