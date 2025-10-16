import communityNightDesign from './community-night.json';
import missionUpdateDesign from './mission-update.json';
import sunriseDesign from './sunrise-service.json';

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  preview: string;
  design: Record<string, unknown> & { width: number; height: number };
}

const createPreview = ({
  background,
  accent,
  title,
  subtitle,
  textColor,
}: {
  background: string;
  accent?: string;
  title: string;
  subtitle: string;
  textColor: string;
}): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="480" viewBox="0 0 320 480">
      <rect width="320" height="480" fill="${background}" />
      ${accent ? `<rect width="320" height="140" y="340" fill="${accent}" />` : ''}
      <text x="50%" y="200" text-anchor="middle" font-family="'Montserrat', 'Open Sans', sans-serif" font-size="42" font-weight="700" fill="${textColor}">
        ${title}
      </text>
      <text x="50%" y="260" text-anchor="middle" font-family="'Open Sans', sans-serif" font-size="20" fill="${textColor}" opacity="0.85">
        ${subtitle.replace(/\n/g, ' ')}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const templateRepository: TemplateDefinition[] = [
  {
    id: 'sunrise-service',
    title: 'Sunrise Service',
    description: 'Warm sunrise palette with bold headline and invitation details.',
    preview: createPreview({
      background: '#FF8C42',
      accent: '#FFB347',
      title: 'Sunrise Service',
      subtitle: 'Join us on the hill at dawn',
      textColor: '#FFFFFF',
    }),
    design: sunriseDesign as TemplateDefinition['design'],
  },
  {
    id: 'community-night',
    title: 'Community Night',
    description: 'Dark modern poster featuring event schedule and footer tag.',
    preview: createPreview({
      background: '#1F2937',
      accent: '#111827',
      title: 'Community Night',
      subtitle: 'Friday gathering with games and food',
      textColor: '#FFFFFF',
    }),
    design: communityNightDesign as TemplateDefinition['design'],
  },
  {
    id: 'mission-update',
    title: 'Mission Update',
    description: 'Square mission recap layout with headline, bullet points, and CTA.',
    preview: createPreview({
      background: '#F3F4F6',
      accent: '#CBD5F5',
      title: 'Mission Update',
      subtitle: 'Stories from the field and prayer focus',
      textColor: '#1C2B42',
    }),
    design: missionUpdateDesign as TemplateDefinition['design'],
  },
];
