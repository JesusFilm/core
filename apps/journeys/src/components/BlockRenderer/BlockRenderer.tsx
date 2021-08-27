import { ReactElement } from 'react'
import styles from './BlockRenderer.module.css'
import { RadioQuestion } from '../../blocks/RadioQuestion'
import { BlockType } from '../../types'

export function BlockRenderer (block: BlockType): ReactElement {
  return (
    <div className={styles.BlockRenderer} key={block.id}>
      <h1>{block.id}</h1>
      {block.children != null
        ? block.children.map((block) => (
            <BlockRenderer {...block} key={block.id} />
        ))
        : null}
      {block.__typename === 'RadioQuestion'
        ? (
        <RadioQuestion {...block} />
          )
        : null}
    </div>
  )
}

export default BlockRenderer
