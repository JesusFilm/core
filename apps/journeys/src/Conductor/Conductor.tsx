import React, { ReactNode, useState } from 'react'
import styles from './Conductor.module.css';
import {BlockRenderer, Block} from '../BlockRenderer/BlockRenderer';


export function Conductor(blocks: Block[]) {
  const [currentBlock, setCurrentBlock] = useState(0)

  const handleClick = () => {
    if (blocks[currentBlock + 1]) {
      setCurrentBlock(currentBlock + 1)
    }
  }

  return (
    <div className={styles.Conductor} onClick={handleClick}>
      <BlockRenderer {...blocks[currentBlock]} />
    </div>
  );
}

export default Conductor;
