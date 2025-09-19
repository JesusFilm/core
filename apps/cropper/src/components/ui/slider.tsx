'use client'

import clsx from 'clsx'

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Slider({ className, label, ...props }: SliderProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-xs font-medium text-slate-400">
      {label ? <span>{label}</span> : null}
      <input
        type="range"
        className={clsx(
          'group h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-50',
          '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/80 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(15,23,42,0.8)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 focus-visible:[&::-webkit-slider-thumb]:scale-115 disabled:[&::-webkit-slider-thumb]:border-slate-500/60 disabled:[&::-webkit-slider-thumb]:bg-slate-500',
          '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white/80 [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-[0_0_0_2px_rgba(15,23,42,0.8)] disabled:[&::-moz-range-thumb]:border-slate-500/60 disabled:[&::-moz-range-thumb]:bg-slate-500',
          className
        )}
        {...props}
      />
    </label>
  )
}
