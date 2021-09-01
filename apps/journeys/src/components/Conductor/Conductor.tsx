import { BlockRenderer } from '../BlockRenderer'
import { ReactElement, useEffect } from 'react'
import { ConductorProps } from '../../types'
import { useAppDispatch, useAppSelector } from '../../libs/store/store'
import { setBlocks } from './conductorSlice'

export function Conductor ({ blocks }: ConductorProps): ReactElement {
  const active = useAppSelector((state) => state.conductor.active)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setBlocks(blocks))
  }, [dispatch, blocks])

  return (active != null) ? <BlockRenderer {...active} /> : <></>
}

export default Conductor
