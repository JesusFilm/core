import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../libs/store/store'
import { setBlocks } from './conductorSlice'
import { TreeBlock } from '../../libs/transformer/transformer'

interface ConductorProps {
  blocks: TreeBlock[]
}

export function Conductor ({ blocks }: ConductorProps): ReactElement {
  const active = useAppSelector((state) => state.conductor.active)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBlocks(blocks))
  }, [dispatch, blocks])

  return (active != null) ? <BlockRenderer {...active} /> : <></>
}

export default Conductor
