import debounce from 'lodash/debounce'
import {
  ComponentProps,
  ReactElement,
  useEffect,
  useMemo,
  useState
} from 'react'
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful'

export function DebouncedHexAlphaColorPicker({
  color,
  onChange,
  enableAlpha = true,
  ...props
}: ComponentProps<typeof HexAlphaColorPicker> & {
  enableAlpha?: boolean
}): ReactElement {
  const [value, setValue] = useState(color)

  const debouncedChange = useMemo(
    () =>
      debounce((value: string) => {
        onChange?.(value)
      }, 100),

    [onChange]
  )

  useEffect(() => {
    return () => {
      debouncedChange.cancel()
    }
  }, [debouncedChange])

  useEffect(() => {
    setValue(color)
  }, [color])

  async function handleChange(value: string): Promise<void> {
    void debouncedChange(value.toUpperCase())
    setValue(value.toUpperCase())
  }

  return enableAlpha ? (
    <HexAlphaColorPicker
      data-testid="HexAlphaColorPicker"
      color={value}
      onChange={handleChange}
      {...props}
    />
  ) : (
    <HexColorPicker
      data-testid="HexColorPicker"
      color={value}
      onChange={handleChange}
      {...props}
    />
  )
}
