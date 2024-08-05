import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { ReactElement, forwardRef, useEffect } from 'react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

import { StepFields } from '../../../../__generated__/StepFields'

interface Props {
  blocks: TreeBlock[]
}

export function DynamicCardList({ blocks }: Props): ReactElement {
  const { blockHistory, getNextBlock, setShowHeaderFooter } = useBlocks()

  const treeBlock = blockHistory[blockHistory.length - 1] as
    | TreeBlock<StepFields>
    | undefined
  // first block used for search bots crawl
  const firstBlock = blocks[0] as TreeBlock<StepFields> | undefined
  const currentBlock = treeBlock ?? firstBlock
  const previousBlock = blockHistory[blockHistory.length - 2] as
    | TreeBlock<StepFields>
    | undefined
  const nextBlock = getNextBlock({ activeBlock: currentBlock })

  useEffect(() => {
    setShowHeaderFooter(true)
  }, [currentBlock, setShowHeaderFooter])

  return (
    <>
      {blocks.map((block) => {
        const isCurrent = block.id === currentBlock?.id
        // test via e2e: navigation to and from non-pre-rendered cards
        const isPreRender =
          block.id === nextBlock?.id || block.id === previousBlock?.id

        return (
          <Fade
            key={block.id}
            in={isCurrent}
            timeout={{ appear: 0, enter: 200, exit: 0 }}
          >
            <DynamicCard
              isCurrent={isCurrent}
              isPreRender={isPreRender}
              block={block}
            />
          </Fade>
        )
      })}
    </>
  )
}

interface DynamicCardProps {
  isCurrent: boolean
  isPreRender: boolean
  block: TreeBlock
}
const DynamicCard = forwardRef<HTMLDivElement, DynamicCardProps>(
  function DynamicCard({ isCurrent, isPreRender, block }, ref) {
    const { setShowNavigation } = useBlocks()

    return (
      <Box
        ref={ref}
        className={isCurrent ? 'active-card' : undefined}
        onClick={() => setShowNavigation(true)}
        sx={{
          width: 'inherit',
          position: 'relative',
          height: '100%',
          display: isCurrent ? 'block' : 'none'
        }}
      >
        {isCurrent || isPreRender ? (
          <Box
            data-testid={`journey-card-${block.id}`}
            sx={{
              height: '100%'
            }}
          >
            <BlockRenderer block={block} />
          </Box>
        ) : (
          <></>
        )}
      </Box>
    )
  }
)
