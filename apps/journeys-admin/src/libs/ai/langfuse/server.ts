import { Langfuse } from 'langfuse'
import { LangfuseExporter } from 'langfuse-vercel'

export const langfuseEnvironment = 'ux'

export const langfuseExporter = new LangfuseExporter({
  environment: langfuseEnvironment
})

export const langfuse = new Langfuse({
  environment: langfuseEnvironment
})
