import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { experimental_useObject as useObject } from 'ai/react'
import { Form, Formik } from 'formik'
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

  console.log(object)

  // Update blocks when a complete object is received
  if (object?.blocks && Array.isArray(object.blocks)) {
    const newBlocks = object.blocks.filter(
      (block) => !blocks.some((existingBlock) => existingBlock.id === block.id)
    )
    if (newBlocks.length > 0) {
      setBlocks((prevBlocks) => [...prevBlocks, ...newBlocks])
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Formik
        initialValues={{ prompt: '' }}
        onSubmit={async (values, { setSubmitting }) => {
          console.log('values', values.prompt)
          await submit(values.prompt)
          // setSubmitting(false)
        }}
      >
        {({ isSubmitting, values, handleChange, handleBlur, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                id="prompt"
                name="prompt"
                label={t('User Prompt')}
                variant="outlined"
                value={values.prompt}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || isLoading}
              >
                {t('Generate Journey')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {error && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          {t('An error occurred while generating the journey')}
        </Typography>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>{t('Generating journey...')}</Typography>
        </Box>
      )}

      {object?.blocks?.map((block, index) => (
        <Box
          key={index}
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
            overflowX: 'auto'
          }}
        >
          <pre>{JSON.stringify(block, null, 2)}</pre>
        </Box>
      ))}
    </Box>
  )
}
