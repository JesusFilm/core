import { BaseBlockProps } from '../BlockRenderer/BlockRenderer';
import { ConductorContext } from '../Conductor/Conductor';

export type VideoBlockProps = BaseBlockProps & VideoProps

type VideoProps = {
  src: string
  __typename: 'video',
  action?: string
}

export function BlockRendererVideo(block: VideoBlockProps) {
  return (
    <ConductorContext.Consumer>
      {({goTo}) => {
        return(
        <div onClick={() => goTo( block.action ? block.action : undefined)}>
          {block.src}
          {block.children}
        </div>
      )}}
    </ConductorContext.Consumer>
  );
}

export default BlockRendererVideo;
