import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TreeBlock } from '../../libs/transformer/transformer'

// Define a type for the slice state
export interface ConductorState {
  active?: TreeBlock
  blocks: TreeBlock[]
}

// Define the initial state using that type
const initialState: ConductorState = {
  blocks: []
}

export const conductorSlice = createSlice({
  name: 'conductor',
  initialState,
  reducers: {
    setBlocks: (state, action: PayloadAction<TreeBlock[]>) => {
      state.blocks = action.payload
      state.active = action.payload[0]
    },
    navigate: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload != null) {
        const block = state.blocks.find((block) => block.id === action.payload)
        if (block != null) {
          state.active = block
        }
      } else if (state.active != null) {
        const index = state.blocks.findIndex((block) => block.id === state.active?.id)
        if (index > -1 && state.blocks[index + 1] != null) {
          state.active = state.blocks[index + 1]
        }
      }
    }
  }
})

export const { setBlocks, navigate } = conductorSlice.actions

export default conductorSlice.reducer
