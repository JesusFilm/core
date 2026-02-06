export const subtitlesWorkflowStages = [
  {
    name: 'Generate raw subtitles',
    path: 'subtitles/generate/step1/generateSubtitles.ts',
    description:
      'Call @mux/ai/primitives to generate a base subtitle file from the Mux asset.'
  },
  {
    name: 'Post-process with OpenAI',
    path: 'subtitles/generate/step2/postProcessSubtitles.ts',
    description:
      'Use the Mux AI OpenAI helper to improve punctuation, casing, and timing.'
  },
  {
    name: 'Upload to Mux',
    path: 'subtitles/generate/step3/uploadSubtitles.ts',
    description: 'Upload the improved subtitle file back to Mux.'
  }
]
