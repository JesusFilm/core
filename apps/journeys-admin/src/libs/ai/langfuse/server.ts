import { Langfuse } from 'langfuse'
import { LangfuseExporter } from 'langfuse-vercel'

export const langfuseEnvironment = 'nes594'

export const langfuseExporter = new LangfuseExporter({
  environment: langfuseEnvironment
})

export const langfuse = new Langfuse({
  environment: langfuseEnvironment
})
