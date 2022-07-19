import { TreeBlock } from '@core/journeys/ui/block'
import { ReactElement } from 'react'

interface PreviewProps {
  block: TreeBlock
}
export function Preview({ block }: PreviewProps): ReactElement {
  return (
    <div {...props}>
      <JourneyPreview journey={journey} />
    </div>
  )
}
