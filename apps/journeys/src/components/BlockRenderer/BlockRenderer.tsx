import styles from './BlockRenderer.module.css';
import { RadioQuestion } from '../../blocks/RadioQuestion';
import { JourneysThemeProvider } from '../JourneysThemeProvider';
import { BlockType } from '../../types';

export function BlockRenderer(block: BlockType) {
  return (
    <div className={styles.BlockRenderer} key={block.id}>
      <h1>{block.id}</h1>
      {block.children
        ? block.children.map((block) => (
            <BlockRenderer {...block} key={block.id} />
          ))
        : null}
      {block.__typename === 'RadioQuestion' ? (
        <RadioQuestion block={block} />
      ) : null}
    </div>
  );
}

export default BlockRenderer;
