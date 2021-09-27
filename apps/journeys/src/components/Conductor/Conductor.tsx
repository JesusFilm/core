import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import { JourneyProgress } from '../JourneyProgress'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, activeBlock } = useBlocks()

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  return activeBlock != null ? (
    <>
      <JourneyProgress />
      <BlockRenderer {...activeBlock} />
    </>
  ) : (
    <></>
  )
}

export default Conductor
