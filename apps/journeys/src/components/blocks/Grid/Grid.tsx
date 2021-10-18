import { ReactElement } from 'react'
import { GetJourney_journey_blocks_GridBlock as GridBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Grid as MaterialGrid } from '@mui/material'
import { BlockRenderer } from "../../BlockRenderer";

export function Grid({ md = '_12', type = 'container', children }: TreeBlock<GridBlock>): ReactElement {
  const columnSize = parseInt(md.split("_")[1]);
  
  return (
    <MaterialGrid
      container={type.includes("container")}
      item={type.includes("item")}
      md={type.includes("item") ? columnSize : undefined}
      sm={type.includes("item") ? 12 : undefined}
      xs={type.includes("item") ? 12 : undefined}
      spacing={type.includes("container") ? 3 : undefined}
    >
      {children?.map((block) => (
        <BlockRenderer {...block} key={block.id} />
      ))}
    </MaterialGrid>
  );
}
