import { ReactElement, useEffect, useState } from 'react'

import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Form } from '@core/journeys/ui/Form'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../../__generated__/GetJourney'

export function FormWrapper({ block, children }: WrapperProps): ReactElement {
  const defaultRenderElement = Form({
    __typename: 'FormBlock',
    id: '',
    parentBlockId: null,
    parentOrder: null,
    form: null,
    action: null,
    children: []
  })

  const [renderElement, setRenderElement] = useState(defaultRenderElement)
  const formBlock = block as FormBlock

  // Issue: Formium component does not rerender if form is updated
  // Force Formium component to rerender
  useEffect(() => {
    setRenderElement(defaultRenderElement)

    if (formBlock.__typename === 'FormBlock' && formBlock?.form != null) {
      setTimeout(() => setRenderElement(children), 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formBlock.form])

  return renderElement
}
