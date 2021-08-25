import styles from './BlockRenderer.module.css';
import { RadioQuestion } from '../Blocks/MultipleChoice/MultipleChoice';

export type Block = {
  id: string;
  children?: Block[];
  parentId?: string;
};

export function BlockRenderer(block: Block) {
  return (
    <div className={styles.BlockRenderer} key={block.id}>
      <h1>{block.id}</h1>
      {block.children
        ? block.children.map((block) => (
            <BlockRenderer {...block} key={block.id} />
          ))
        : null}
      {block.id === 'RadioQuestions' ? <RadioQuestion {...block} /> : null}
    </div>
  );
}

export default BlockRenderer;
