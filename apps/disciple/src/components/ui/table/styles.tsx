import { isWeb } from '@gluestack-ui/nativewind-utils/IsWeb'
import { tva } from '@gluestack-ui/nativewind-utils/tva'

const captionTableStyle = isWeb ? 'caption-bottom' : ''

export const tableStyle = tva({
  base: `table w-[800px] border-collapse`
})

export const tableHeaderStyle = tva({
  base: ''
})

export const tableBodyStyle = tva({
  base: ''
})

export const tableFooterStyle = tva({
  base: ''
})

export const tableHeadStyle = tva({
  base: 'text-typography-800 font-roboto flex-1 px-6 py-[14px] text-left text-[16px] font-bold leading-[22px]'
})

export const tableRowStyleStyle = tva({
  base: 'border-outline-200 bg-background-0 border-0 border-b border-solid',
  variants: {
    isHeaderRow: {
      true: ''
    },
    isFooterRow: {
      true: 'border-b-0'
    }
  }
})

export const tableDataStyle = tva({
  base: 'text-typography-800 font-roboto flex-1 px-6 py-[14px] text-left text-[16px] font-medium leading-[22px]'
})

export const tableCaptionStyle = tva({
  base: `${captionTableStyle} text-typography-800 bg-background-50 font-roboto px-6 py-[14px] text-[16px] font-normal leading-[22px]`
})
