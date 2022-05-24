import { ReactElement, useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import findIndex from 'lodash/findIndex'
import { TreeBlock, getStepHeading, useBlocks } from '../..'
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
  const { treeBlocks } = useBlocks()

  const heading = getHeading({ blockId, children, treeBlocks })

  useEffect(() => {
    if (!admin) {
      const id = uuidv4()
      void stepViewEventCreate({
        variables: { input: { id, blockId } }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'step_view',
          eventId: id,
          blockId,
          stepName: heading
        }
      })
    }
  }, [blockId, stepViewEventCreate, admin, heading])

  return (
    <>
      {children.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </>
  )
}

interface GetHeadingProps {
  blockId: string
  children: TreeBlock[]
  treeBlocks: TreeBlock[]
}

export function getHeading({
  blockId,
  children,
  treeBlocks
}: GetHeadingProps): string {
  const title = getStepHeading(children)
  if (title != null) {
    return title
  } else {
    const index = findIndex(treeBlocks, { id: blockId })
    if (index === -1) {
      return 'Untitled'
    } else {
      return `Step ${index + 1}`
    }
  }
}
