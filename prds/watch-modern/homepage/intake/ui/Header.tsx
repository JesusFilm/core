import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Globe, Search } from "lucide-react";

export function Header() {
  return (
    <div 
      data-testid="CollectionsHeader" 
      className="absolute top-0 left-0 right-0 w-full h-[80px] lg:h-[120px] max-w-[1920px] mx-auto z-[99] flex items-center justify-between px-20"
    >
      <a href="https://www.jesusfilm.org/watch">
        <ImageWithFallback
          alt="JesusFilm Project"
          width={70}
          height={70}
          src="https://www.jesusfilm.org/watch/assets/jesusfilm-sign.svg"
          className="max-w-[50px] lg:max-w-[70px] w-auto h-auto"
        />
      </a>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search videos..."
            className="w-64 pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 text-white placeholder-white/60 text-sm"
            data-testid="SearchField"
          />
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" 
            focusable={false} 
            aria-hidden="true"
          />
        </div>
        
        <button
          className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 text-white"
          type="button"
          data-testid="LanguageButton"
          aria-label="select language"
        >
          <Globe 
            className="w-6 h-6" 
            focusable={false} 
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}