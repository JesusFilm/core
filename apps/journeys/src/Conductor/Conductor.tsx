import { useState, createContext } from 'react'
import styles from './Conductor.module.css';
import { BlockRenderer, BlockProps } from '../BlockRenderer/BlockRenderer';

export type NextStepProps = (id?: string) => void

export const ConductorContext = createContext({
  currentBlock: {},
  goTo: (id?: string) => {},
});

export function Conductor(blocks: BlockProps[]) {
  const [currentBlock, setCurrentBlock] = useState(blocks[0])

  const handleNextStep: NextStepProps = (id) => {
    console.log(currentBlock)
    console.log(blocks)
    console.log(`ACTION: ${id}`)
    if (id) {
      const newBlock = [...blocks].find(block => block.id == id) || blocks[0]
      setCurrentBlock(newBlock)
    } else {
      const index = [...blocks].findIndex(block => block.id === currentBlock.id)
      const next = blocks[index + 1] ? blocks[index + 1] : blocks[index]
      console.log('newBlocknext :>> ', next);
      setCurrentBlock(next)
    }
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
