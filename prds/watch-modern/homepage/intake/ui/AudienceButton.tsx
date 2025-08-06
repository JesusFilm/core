import { Button } from "./ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface AudienceButtonProps {
  option: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function AudienceButton({ option, icon: Icon, onClick }: AudienceButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-white/10 backdrop-blur-sm text-stone-200 hover:bg-white/20 rounded-full font-semibold transition-all duration-200 flex justify-between border border-white/20 shadow-lg hover:shadow-xl text-xl h-auto tracking-wide !px-6 py-[14px] text-left"
    >
      <div className="flex items-center gap-4">
        <Icon 
          className="flex-shrink-0 text-stone-200" 
          style={{ width: '40px', height: '40px' }}
          strokeWidth={1.5}
        />
        <span>{option}</span>
      </div>
      <ArrowRight className="w-6 h-6 flex-shrink-0 text-stone-200" />
    </Button>
  );
}