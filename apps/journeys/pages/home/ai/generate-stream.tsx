import { experimental_useObject as useObject } from 'ai/react'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { z } from 'zod'

import { BlockUnionSchema } from '@core/yoga/zodSchema/blocks/blockUnion.zod'

// Define schema for streaming blocks
const streamingJourneySchema = z.object({
  blocks: z.array(BlockUnionSchema)
})

export default function GenerateStreamPage() {
  const [blocks, setBlocks] = useState<z.infer<typeof BlockUnionSchema>[]>([])
  const { t } = useTranslation()

  const { object, isLoading, error, submit } = useObject({
    api: '/api/ai/generateJourney',
    schema: streamingJourneySchema,
    onFinish: ({ object }) => {
      if (object?.blocks) {
        setBlocks((prevBlocks) => [...prevBlocks, ...object.blocks])
      }
    }
  })

  // Update blocks as they stream in
  if (object?.blocks) {
    setBlocks((prevBlocks) => [...prevBlocks, ...object.blocks])
  }

  return (
    <div>
      <button
        onClick={() => submit('Create a journey about forgiveness')}
        disabled={isLoading}
      >
        {t('Generate Journey')}
      </button>

      {error && (
        <div className="text-red-500">
          {t('An error occurred while generating the journey')}
        </div>
      )}

      {isLoading && <div>Generating journey...</div>}

      {blocks.map((block, index) => (
        <div key={index}>
          <pre>{JSON.stringify(block, null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}
