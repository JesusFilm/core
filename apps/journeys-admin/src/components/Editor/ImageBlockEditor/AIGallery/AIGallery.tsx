import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'

import { CreateAiImage } from '../../../../../__generated__/CreateAiImage'
import { SegmindModel } from '../../../../../__generated__/globalTypes'

import { AIPrompt } from './AIPrompt'

export const CREATE_AI_IMAGE = gql`
  mutation CreateAiImage($prompt: String!, $model: SegmindModel!) {
    createImageBySegmindPrompt(prompt: $prompt, model: $model) {
      id
    }
  }
`

export function AIGallery(): ReactElement {
  const somePrompt =
    'picture of a Maori man with glasses and a beard and he is wearing a shirt that says Jesus Film. Make him be sitting in front of a computer like a really cool nerd'
  const [textValue, setTextvalue] = useState<string | null>(somePrompt)

  const [createAiImage] = useMutation<CreateAiImage>(CREATE_AI_IMAGE)

  const handleSubmit = (): void => {
    console.log(textValue)
    void createAiImage({
      variables: {
        prompt: textValue,
        model: SegmindModel.sdxl1__0_txt2img
      }
    })
  }

  const handleChange = (e): void => {
    setTextvalue(e.target.value)
    console.log(textValue)
  }
  return (
    <Box>
      <AIPrompt
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        textValue={textValue}
      />
    </Box>
  )
}
