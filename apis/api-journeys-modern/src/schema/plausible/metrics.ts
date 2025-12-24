import { GraphQLResolveInfo, Kind, SelectionNode } from 'graphql'
import pull from 'lodash/pull'
import snakeCase from 'lodash/snakeCase'

const DEFAULT_METRIC = 'visitors'

export function getMetrics(info: GraphQLResolveInfo): string {
  const selections = info.fieldNodes[0].selectionSet?.selections ?? []
  const metrics = pull(
    getFieldNames(info, selections),
    'property',
    'typename',
    '__typename'
  ).join(',')
  return metrics === '' ? DEFAULT_METRIC : metrics
}

function getFieldNames(
  info: GraphQLResolveInfo,
  selections: readonly SelectionNode[]
): string[] {
  return selections.flatMap((selection) => {
    switch (selection.kind) {
      case Kind.FIELD:
        return snakeCase(selection.name.value)
      case Kind.FRAGMENT_SPREAD:
        return getFieldNames(
          info,
          info.fragments[selection.name.value].selectionSet.selections
        )
      case Kind.INLINE_FRAGMENT:
        return getFieldNames(info, selection.selectionSet?.selections ?? [])
      default:
        return []
    }
  })
}
