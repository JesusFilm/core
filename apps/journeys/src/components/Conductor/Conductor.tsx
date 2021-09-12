import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect } from 'react'
import { TreeBlock } from '../../libs/transformer/transformer'
import { useBlocks } from '../../libs/client/cache/blocks'
import { useReactiveVar } from '@apollo/client'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor ({ blocks }: ConductorProps): ReactElement {
  const { setTreeBlocks, activeBlockVar } = useBlocks()
  const active = useReactiveVar(activeBlockVar)

  useEffect(() => {
    setTreeBlocks(blocks)
  }, [setTreeBlocks, blocks])

  return (active != null) ? <BlockRenderer {...active} /> : <></>
}

export default Conductor
