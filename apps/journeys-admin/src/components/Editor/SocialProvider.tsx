import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useState
} from 'react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../__generated__/GetJourney'

interface Context {
  seoTitle?: string | null
  setSeoTitle: (value?: string | null) => void
  seoDescription?: string | null
  setSeoDescription: (value?: string | null) => void
}

const SocialPreviewContext = createContext<Context>({
  setSeoDescription: () => null,
  setSeoTitle: () => null
})

export function useSocialPreview(): Context {
  return useContext(SocialPreviewContext)
}

interface SocialProviderProps {
  initialValues?: {
    seoTitle?: string | null
    seoDescription?: string | null
    primaryImageBlock?: Partial<ImageBlock> | null
  }
  children: ReactNode
}

export function SocialProvider({
  children,
  initialValues // used for testing
}: SocialProviderProps): ReactElement {
  const [seoTitle, setSeoTitle] = useState<string | null | undefined>(
    initialValues?.seoTitle
  )
  const [seoDescription, setSeoDescription] = useState<
    string | null | undefined
  >(initialValues?.seoDescription)
  return (
    <SocialPreviewContext.Provider
      value={{
        seoTitle,
        setSeoTitle,
        seoDescription,
        setSeoDescription
      }}
    >
      {children}
    </SocialPreviewContext.Provider>
  )
}
