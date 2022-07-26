import { ReactElement } from 'react'

interface TemplateCardProps {
  template: Template
}

// This should be updated to use type journey
interface Template {
  id: string
  title: string
  date: string
  description: string
  socialShareImage: string
}

export function TemplateCard({ template }: TemplateCardProps): ReactElement {
  return (
    <>
      <div>{`${template.title}`}</div>
    </>
  )
}
