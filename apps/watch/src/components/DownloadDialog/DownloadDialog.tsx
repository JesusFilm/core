import { ComponentProps, ReactElement } from 'react'

import { DialogDownload } from '../DialogDownload'

export function DownloadDialog(
  props: ComponentProps<typeof DialogDownload>
): ReactElement {
  return <DialogDownload {...props} testId="DownloadDialog" />
}
