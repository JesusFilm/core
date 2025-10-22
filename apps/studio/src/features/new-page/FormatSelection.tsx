'use client'

import {
  Globe,
  Image as ImageIcon,
  MessageCircle,
  Printer,
  Video
} from 'lucide-react'
import { useState } from 'react'

export const FormatSelection = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('')

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
  }

  const formats = [
    {
      name: 'Images',
      icon: ImageIcon,
      gradient:
        'bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 border-purple-500'
    },
    {
      name: 'Videos',
      icon: Video,
      gradient:
        'bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 border-blue-500'
    },
    {
      name: 'Text',
      icon: MessageCircle,
      gradient:
        'bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600 border-emerald-500'
    },
    {
      name: 'Web',
      icon: Globe,
      gradient:
        'bg-gradient-to-br from-orange-500 via-yellow-600 to-amber-600 border-orange-500'
    },
    {
      name: 'Print',
      icon: Printer,
      gradient:
        'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 border-rose-500'
    }
  ]

  return (
    <div className="mt-12 hidden">
      <div className="flex items-center gap-4 mb-4">
        <label className="text-lg font-semibold">In what format?</label>
        <span className="text-sm text-muted-foreground">
          Expected output format from this task
        </span>
      </div>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {formats.map(({ name, icon: Icon, gradient }) => {
          const isSelected = selectedFormat === name
          return (
            <button
              type="button"
              key={name}
              className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
                isSelected
                  ? `${gradient}`
                  : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-600 hover:to-red-600'
              }`}
              onClick={() => handleFormatChange(name)}
            >
              <div className="p-3">
                <Icon
                  className={`w-8 h-8 ${
                    isSelected
                      ? 'text-white drop-shadow-lg'
                      : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                  }`}
                />
              </div>
              <span
                className={`font-medium text-sm text-center ${
                  isSelected
                    ? 'text-white drop-shadow-lg'
                    : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                }`}
              >
                {name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
