type Block = {
  id: string
  children?: Block[]
  parentId?: string
}

export function Transformer(blocks: Block[]): Block[] {
    const setup = new Map();
    const relatedBlocks = new Map();
    const rootBlocks: string[] = [];
    blocks.forEach(block => {
        setup.set(block.id, block);
        !relatedBlocks.get(block.id) ? relatedBlocks.set(block.id, []) : undefined; // noOp.;
        if (!block.parentId) {
            rootBlocks.push(block.id)
            return;
        }
        const parent = relatedBlocks.get(block.parentId) || [];
        parent.push(block.id);
        relatedBlocks.set(block.parentId, parent);
    });

    function build(id: string): Block {
        const blocks = setup.get(id);
        const children: string[] = relatedBlocks.get(id);
        if (children.length === 0) {
            return {...blocks}
        }
        return {...blocks, children: children.map(child => build(child)) };
    }

    return rootBlocks.map(id => build(id));
}

export default Transformer;
