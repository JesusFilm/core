import { useState } from 'react'
import styles from './Conductor.module.css';
import {BlockRenderer} from '../BlockRenderer/BlockRenderer';
import { BlockType } from '../types';


export function Conductor(blocks: BlockType[]) {
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
