import { NewPageLayout } from './NewPageLayout'
import { useNewPageController } from './useNewPageController'

export default function NewPageView() {
  const controller = useNewPageController()

  return <NewPageLayout controller={controller} />
}
