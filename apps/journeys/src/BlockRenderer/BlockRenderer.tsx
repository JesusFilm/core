import styles from './BlockRenderer.module.css';

export type Block = {
  id: string
  children?: Block[]
  parentId?: string
}

export function BlockRenderer(block: Block) {
  return (
    <div className={styles.BlockRenderer}  key={block.id} >
        <h1>{block.id}</h1>
        {block.children ? block.children.map(block => <BlockRenderer {...block} key={block.id} />) : null}
    </div>
  );
}

export default BlockRenderer;
