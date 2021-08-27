import styles from './Conductor.module.css'
import { BlockRenderer } from '../BlockRenderer'
import { useState, ReactElement } from 'react'
import { ConductorProps, NextStepProps, BlockType } from '../../types'
import ConductorContext from './ConductorContext'

export function Conductor ({ blocks }: ConductorProps): ReactElement {
  const [currentBlock, setCurrentBlock] = useState(blocks[0])

  const handleNextStep: NextStepProps = (id) => {
    console.log('next step clicked. id value:', id)
    let nextBlock: BlockType | undefined
    if (id != null) {
      nextBlock = blocks.find(block => block.id === id)
    } else {
      const index = blocks.findIndex(block => block.id === currentBlock.id)
      if (index > -1) {
        nextBlock = blocks[index + 1]
      }
    }
    ;(nextBlock != null) && setCurrentBlock(nextBlock)
  }

  return (
    <div className={styles.Conductor}>
      <ConductorContext.Provider value={{
        currentBlock: currentBlock,
        goTo: handleNextStep
      }}>
        <BlockRenderer {...currentBlock} />
      </ConductorContext.Provider>
    </div>
  )
}

export default Conductor
