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
  uuid?: () => string
  wrappers?: WrappersProps
}

export function Step({
  id: blockId,
  children,
  uuid = uuidv4,
  wrappers
}: StepProps): ReactElement {
  const [stepViewEventCreate] = useMutation<StepViewEventCreate>(
    STEP_VIEW_EVENT_CREATE
  )

  async function createResponse(blockId: string): Promise<void> {
    const id = uuid()
    await stepViewEventCreate({
      variables: { input: { id, blockId } },
      optimisticResponse: {
        stepViewEventCreate: {
          id,
          __typename: 'StepViewEvent'
        }
      }
    })
  }

  useEffect(() => {
    void createResponse(blockId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId])

  return (
    <>
      {children.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </>
  )
}
