import { Langfuse } from 'langfuse'
import { LangfuseExporter } from 'langfuse-vercel'

export const langfuseEnvironment =
  process.env.VERCEL_ENV ??
  process.env.DD_ENV ??
  process.env.NODE_ENV ??
  'development'

export const langfuseExporter = new LangfuseExporter({
  environment: langfuseEnvironment
})

export const langfuse = new Langfuse({
  environment: langfuseEnvironment
})
