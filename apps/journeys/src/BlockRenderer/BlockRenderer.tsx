import styles from './BlockRenderer.module.css';
import { BlockRendererVideo, VideoBlockProps } from '../BlockRendererVideo/BlockRendererVideo';
import { BlockRendererRadioOption, RadioOptionBlockProps } from '../BlockRendererRadioOption/BlockRendererRadioOption';

export interface BaseBlockProps {
  id: string
  children?: BlockProps[]
  parentId?: string
  __typename: "video" | "radioOption"
  action?: string
}

export type BlockProps = VideoBlockProps | RadioOptionBlockProps

export function BlockRenderer(block: BlockProps) {
  const children =
    block.children ?
    block.children.map((block: BlockProps, index: number) => BlockSwitcher(block, index))
    : null

  return (
    <div className={styles.BlockRenderer} >
      <em>Root Block {block.id}</em>
      {BlockSwitcher(block, 1000, children)}
    </div>
  );
}

const BlockSwitcher = (block: BlockProps, key: number, children?: any) => {
  switch (block.__typename) {
    case 'video':
      return <BlockRendererVideo {...block} key={key} >{children}</BlockRendererVideo>
    case 'radioOption':
      return <BlockRendererRadioOption {...block} key={key} >{children}</BlockRendererRadioOption>
    default:
      return null
  }
}

export default BlockRenderer;
