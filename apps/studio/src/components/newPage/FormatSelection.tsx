import { Globe, Image as ImageIcon, MessageCircle, Printer, Video } from 'lucide-react'
import { useState } from 'react'
import type { ReactElement } from 'react'

export function FormatSelection(): ReactElement {
  const [selectedFormat, setSelectedFormat] = useState<string>('')

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
  }

  return (
    <div className="mt-12 hidden">
      <div className="flex items-center gap-4 mb-4">
        <label className="text-lg font-semibold">
          In what format?
        </label>
        <span className="text-sm text-muted-foreground">
          Expected output format from this task
        </span>
      </div>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {/* Images */}
        <div
          className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
            selectedFormat === 'Images'
              ? 'bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 border-purple-500'
              : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-600 hover:to-red-600'
          }`}
          onClick={() => handleFormatChange('Images')}
        >
          <div className="p-3">
            <ImageIcon
              className={`w-8 h-8 ${selectedFormat === 'Images' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            />
          </div>
          <span
            className={`font-medium text-sm text-center ${selectedFormat === 'Images' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
          >
            Images
          </span>
        </div>

        {/* Videos */}
        <div
          className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
            selectedFormat === 'Videos'
              ? 'bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 border-blue-500'
              : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-blue-500 hover:via-cyan-600 hover:to-teal-600'
          }`}
          onClick={() => handleFormatChange('Videos')}
        >
          <div className="p-3">
            <Video
              className={`w-8 h-8 ${selectedFormat === 'Videos' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            />
          </div>
          <span
            className={`font-medium text-sm text-center ${selectedFormat === 'Videos' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
          >
            Videos
          </span>
        </div>

        {/* Text */}
        <div
          className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
            selectedFormat === 'Text'
              ? 'bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600 border-emerald-500'
              : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-emerald-500 hover:via-green-600 hover:to-lime-600'
          }`}
          onClick={() => handleFormatChange('Text')}
        >
          <div className="p-3">
            <MessageCircle
              className={`w-8 h-8 ${selectedFormat === 'Text' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            />
          </div>
          <span
            className={`font-medium text-sm text-center ${selectedFormat === 'Text' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
          >
            Text
          </span>
        </div>

        {/* Web */}
        <div
          className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
            selectedFormat === 'Web'
              ? 'bg-gradient-to-br from-orange-500 via-yellow-600 to-amber-600 border-orange-500'
              : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-orange-500 hover:via-yellow-600 hover:to-amber-600'
          }`}
          onClick={() => handleFormatChange('Web')}
        >
          <div className="p-3">
            <Globe
              className={`w-8 h-8 ${selectedFormat === 'Web' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            />
          </div>
          <span
            className={`font-medium text-sm text-center ${selectedFormat === 'Web' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
          >
            Web
          </span>
        </div>

        {/* Print */}
        <div
          className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
            selectedFormat === 'Print'
              ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 border-rose-500'
              : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-rose-500 hover:via-pink-600 hover:to-fuchsia-600'
          }`}
          onClick={() => handleFormatChange('Print')}
        >
          <div className="p-3">
            <Printer
              className={`w-8 h-8 ${selectedFormat === 'Print' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            />
          </div>
          <span
            className={`font-medium text-sm text-center ${selectedFormat === 'Print' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
          >
            Print
          </span>
        </div>
      </div>
    </div>
  )
}
