import { ReactElement, useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { TreeBlock } from '../..'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
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

export function Step({ id, children, wrappers }: StepProps): ReactElement {
  const [stepViewEventCreate] = useMutation<StepViewEventCreate>(
    STEP_VIEW_EVENT_CREATE
  )

  async function createResponse(blockId: string): Promise<void> {
    const uuid = uuidv4()
    await stepViewEventCreate({
      variables: { input: { id: uuid, blockId } },
      optimisticResponse: {
        stepViewEventCreate: {
          id: uuid,
          __typename: 'StepViewEvent'
        }
      }
    })
  }

  useEffect(() => {
    void createResponse(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <>
      {children.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </>
  )
}
