import { ReactElement, useEffect, useState } from 'react'

import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Form } from '@core/journeys/ui/Form'

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

  // Issue: Formium component does not rerender if form is updated
  // Force Formium component to rerender
  useEffect(() => {
    setRenderElement(defaultRenderElement)

    if (block.__typename === 'FormBlock' && block?.form != null) {
      setTimeout(() => setRenderElement(children), 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block])

  return renderElement
}
