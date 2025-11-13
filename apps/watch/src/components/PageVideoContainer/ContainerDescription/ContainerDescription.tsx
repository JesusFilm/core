import { ReactElement } from 'react'

import { TextFormatter } from '../../TextFormatter'

interface ContainerDescriptionProps {
  value: string
}

export function ContainerDescription({
  value
}: ContainerDescriptionProps): ReactElement {
  return (
    <div
      className="text-base leading-relaxed text-white/80"
      data-testid="ContainerDescription"
    >
      <TextFormatter className="text-lg leading-relaxed text-white/80">
        {value}
      </TextFormatter>
    </div>
  )
}
