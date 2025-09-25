import { ReactElement } from 'react'

import { MultiselectOption } from '@core/journeys/ui/MultiselectOption/MultiselectOption'

import { MultiselectOptionFields } from '../../../../../../../../__generated__/MultiselectOptionFields'

export function MultiselectOptionEdit(
  props: MultiselectOptionFields
): ReactElement {
  return <MultiselectOption {...(props as any)} editableLabel={undefined} />
}
