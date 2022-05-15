import { ReactElement, useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { TreeBlock } from '../..'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { useJourney } from '../../libs/context/JourneyContext'
import { StepFields } from './__generated__/StepFields'
import { StepViewEventCreate } from './__generated__/StepViewEventCreate'

export const STEP_VIEW_EVENT_CREATE = gql`
  mutation StepViewEventCreate($input: StepViewEventCreateInput!) {
    stepViewEventCreate(input: $input) {
      id
    }
  }
`

interface StepProps extends TreeBlock<StepFields> {
  wrappers?: WrappersProps
}

export function Step({
  id: blockId,
  children,
  wrappers
}: StepProps): ReactElement {
  const [stepViewEventCreate] = useMutation<StepViewEventCreate>(
    STEP_VIEW_EVENT_CREATE
  )

  const { admin } = useJourney()

  useEffect(() => {
    if (!admin) {
      const id = uuidv4()
      void stepViewEventCreate({
        variables: { input: { id, blockId } }
      })
    }
  }, [blockId, stepViewEventCreate, admin])

  return (
    <>
      {children.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </>
  )
}
