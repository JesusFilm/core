type Block = {
  id: string
  children?: Block[]
  parentId?: string
}

export function Transformer(blocks: Block[]): Block[] {
    const store = new Map(); // stores data indexed by its id
    const rels = new Map(); // stores array of children associated with id
    const roots: string[] = []; // stores root nodes
    blocks.forEach(block => {
        store.set(block.id, block);
        !rels.get(block.id) ? rels.set(block.id, []) : undefined; // noOp.;
        if (!block.parentId) {
            roots.push(block.id)
            return;
        }
        const parent = rels.get(block.parentId) || [];
        parent.push(block.id);
        rels.set(block.parentId, parent);
    });

    function build(id: string): Block {
        const blocks = store.get(id);
        const children: string[] = rels.get(id);
        if (children.length === 0) {
            return {...blocks}
        }
        return {...blocks, children: children.map(c => build(c)) };
    }

    return roots.map(r => build(r));
}

export default Transformer;
