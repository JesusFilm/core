import { TreeBlock } from "@core/journeys/ui/block"
import { BlockFields_StepBlock } from "../../../../../../../../../../__generated__/BlockFields"
import { JourneyFields } from "../../../../../../../../../../__generated__/JourneyFields"
import { handleCreateRadioOption } from "./handleCreateRadioOption"

describe('handleCreateRadioOption', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should create a radio option block when sibling count is provided', () => {
        const dispatch = jest.fn()
        const addBlock = jest.fn()
        const radioOptionBlockCreate = jest.fn()
        const parentBlockId = 'parentBlockId'
        const journey = { id: 'journeyId' } as unknown as JourneyFields
        const selectedStep = {
            __typename: 'StepBlock',
            id: 'stepId',
            parentBlockId: null,
            parentOrder: 0,
            locked: false,
            nextBlockId: null,
            slug: null,
            children: [{ id: 'childBlockId' }]
        } as unknown as TreeBlock<BlockFields_StepBlock>
        const siblingCount = 2

        handleCreateRadioOption({
            dispatch,
            addBlock,
            radioOptionBlockCreate,
            parentBlockId,
            journey,
            selectedStep,
            siblingCount
        })

        expect(addBlock).toHaveBeenCalledTimes(1)
        expect(addBlock).toHaveBeenCalledWith({
            block: expect.objectContaining({
                id: expect.any(String),
                parentBlockId: 'parentBlockId',
                parentOrder: 2,
                __typename: 'RadioOptionBlock',
                label: '',
                action: null,
                pollOptionImageBlockId: null,
                eventLabel: null
            }),
            execute: expect.any(Function)
        })

        const addBlockCall = addBlock.mock.calls[0][0]
        const createdBlock = addBlockCall.block
        addBlockCall.execute()

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SetEditorFocusAction',
            selectedBlockId: createdBlock.id
        })

        expect(radioOptionBlockCreate).toHaveBeenCalledWith({
            variables: {
                input: {
                    id: createdBlock.id,
                    journeyId: 'journeyId',
                    parentBlockId: 'parentBlockId',
                    label: ''
                }
            },
            optimisticResponse: {
                radioOptionBlockCreate: createdBlock
            },
            update: expect.any(Function)
        })
    })

    it('should create a radio option block when sibling count is not provided', () => {
        const dispatch = jest.fn()
        const addBlock = jest.fn()
        const radioOptionBlockCreate = jest.fn()
        const parentBlockId = 'radioQuestion.id'
        const journey = { id: 'journeyId' } as unknown as JourneyFields
        const selectedStep = {
            __typename: 'StepBlock',
            id: 'stepId',
            parentBlockId: null,
            parentOrder: 0,
            locked: false,
            nextBlockId: null,
            slug: null,
            children: [
                {
                    id: 'radioQuestion.id',
                    __typename: 'RadioQuestionBlock',
                    children: [
                        { id: 'radioOption1.id', __typename: 'RadioOptionBlock' },
                        { id: 'radioOption2.id', __typename: 'RadioOptionBlock' },
                        { id: 'radioOption3.id', __typename: 'RadioOptionBlock' }

                    ]
                }
            ]
        } as unknown as TreeBlock<BlockFields_StepBlock>

        handleCreateRadioOption({
            dispatch,
            addBlock,
            radioOptionBlockCreate,
            parentBlockId,
            journey,
            selectedStep,
            siblingCount: undefined
        })

        expect(addBlock).toHaveBeenCalledWith({
            block: expect.objectContaining({
                parentBlockId: 'radioQuestion.id',
                parentOrder: 3,
                __typename: 'RadioOptionBlock',
                label: ''
            }),
            execute: expect.any(Function)
        })

        const addBlockCall = addBlock.mock.calls[0][0]
        addBlockCall.execute()

        expect(dispatch).toHaveBeenCalledWith({
            type: 'SetEditorFocusAction',
            selectedBlockId: addBlockCall.block.id
        })

        expect(radioOptionBlockCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                variables: {
                    input: expect.objectContaining({
                        parentBlockId: 'radioQuestion.id',
                        journeyId: 'journeyId'
                    })
                }
            })
        )
    })

    it('should return early when journey is not provided', () => {
        const dispatch = jest.fn()
        const addBlock = jest.fn()
        const radioOptionBlockCreate = jest.fn()

        handleCreateRadioOption({
            dispatch,
            addBlock,
            radioOptionBlockCreate,
            parentBlockId: 'parentBlockId',
            journey: undefined,
            selectedStep: undefined,
            siblingCount: 0
        })

        expect(addBlock).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
        expect(radioOptionBlockCreate).not.toHaveBeenCalled()
    })
})