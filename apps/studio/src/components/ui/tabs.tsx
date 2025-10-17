"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { cn } from '../../libs/cn/cn'

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

const useTabsContext = (component: string) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error(`${component} must be used within <Tabs>`) // helps debugging
  }
  return context
}

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value: controlledValue, defaultValue, onValueChange, className, children, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : uncontrolledValue

    useEffect(() => {
      if (!isControlled && defaultValue !== undefined) {
        setUncontrolledValue(defaultValue)
      }
    }, [defaultValue, isControlled])

    useEffect(() => {
      if (isControlled && controlledValue !== undefined) {
        setUncontrolledValue(controlledValue)
      }
    }, [controlledValue, isControlled])

    const setValue = useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(nextValue)
        }
        onValueChange?.(nextValue)
      },
      [isControlled, onValueChange]
    )

    const contextValue = useMemo(
      () => ({
        value: currentValue,
        setValue
      }),
      [currentValue, setValue]
    )

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={cn(className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = 'Tabs'

type TabsListProps = React.HTMLAttributes<HTMLDivElement>

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = 'TabsList'

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, onClick, ...props }, ref) => {
    const { value: activeValue, setValue } = useTabsContext('TabsTrigger')
    const isActive = activeValue === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-disabled={disabled}
        tabIndex={isActive ? 0 : -1}
        data-state={isActive ? 'active' : 'inactive'}
        data-disabled={disabled ? '' : undefined}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
          className
        )}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault()
            return
          }
          setValue(value)
          onClick?.(event)
        }}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue } = useTabsContext('TabsContent')
    const isActive = activeValue === value

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        hidden={!isActive}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {isActive ? children : null}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
