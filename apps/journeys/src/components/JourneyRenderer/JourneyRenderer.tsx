import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { StepFields } from '../../../__generated__/StepFields'
import { Conductor } from '../Conductor'
import { WebView } from '../WebView'

export function JourneyRenderer(): ReactElement {
  const { journey } = useJourney()
  const blocks = journey?.blocks != null ? transformer(journey.blocks) : null

  return (
    <>
      {blocks != null && (
        <>
          {journey?.website === true ? (
            <WebView
              blocks={blocks}
              stepBlock={blocks[0] as TreeBlock<StepFields>}
            />
          ) : (
            <Conductor blocks={blocks} />
          )}
        </>
      )}
    </>
  )
}
