import { useState, createContext } from 'react'
import styles from './Conductor.module.css';
import { BlockRenderer, BlockProps } from '../BlockRenderer/BlockRenderer';

export type NextStepProps = (id?: string) => void

export const ConductorContext = createContext({
  currentBlock: {},
  goTo: (id?: string) => {},
});

interface ConductorProps {
  blocks: BlockProps[];
}

export function Conductor({ blocks }: ConductorProps) {
  const [currentBlock, setCurrentBlock] = useState(blocks[0])

  const handleNextStep: NextStepProps = (id?: string) => {
    let nextBlock: BlockProps | undefined
    if (id) {
      nextBlock = blocks.find(block => block.id == id)
    } else {
      const index = blocks.findIndex(block => block.id === currentBlock.id)
      if (index) {
        nextBlock = blocks[index + 1]
      }
    }
    nextBlock && setCurrentBlock(nextBlock)
  }

  return (
    <div className={styles.Conductor}>
      <ConductorContext.Provider value={{
          currentBlock: currentBlock,
          goTo: handleNextStep,
        }}>
        <BlockRenderer {...currentBlock} />
      </ConductorContext.Provider>
    </div>
  );
}

export default Conductor;
