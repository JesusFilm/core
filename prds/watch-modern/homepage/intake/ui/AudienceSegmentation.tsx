import { AudienceButton } from "./AudienceButton";
import { Compass, Sprout, Footprints } from "lucide-react";

const audienceOptions = [
  {
    text: "Discover who Jesus is",
    icon: Compass
  },
  {
    text: "Grow closer to God", 
    icon: Sprout
  },
  {
    text: "Get equipped for ministry",
    icon: Footprints
  }
];

interface AudienceSegmentationProps {
  onOptionSelect?: (option: string, index: number) => void;
}

export function AudienceSegmentation({ onOptionSelect }: AudienceSegmentationProps) {
  const handleOptionClick = (option: string, index: number) => {
    onOptionSelect?.(option, index);
  };

  return (
    <div className="p-8">
      <h2 className="text-white text-4xl font-semibold mb-3 leading-tight">
        Start your journey today.
      </h2>
      <p className="text-stone-200/80 text-xl leading-relaxed mb-8">
        Find personalized videos and guidance based on your faith journey.
      </p>
      
      <div className="space-y-4">
        {audienceOptions.map((option, index) => (
          <AudienceButton
            key={index}
            option={option.text}
            icon={option.icon}
            onClick={() => handleOptionClick(option.text, index)}
          />
        ))}
      </div>
    </div>
  );
}