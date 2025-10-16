import { Alignment, InputGroup, Switch } from '@blueprintjs/core';
import { Search } from '@blueprintjs/icons';
import { observer } from 'mobx-react-lite';
import type { StoreType } from 'polotno/model/store';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import React, { useMemo, useState } from 'react';

import { type TemplateDefinition, templateRepository } from '../templates';

interface CustomTemplatesPanelProps {
  store: StoreType;
}

const CustomTemplatesPanelComponent = ({ store }: CustomTemplatesPanelProps) => {
  const [query, setQuery] = useState('');
  const [matchSize, setMatchSize] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTemplates = useMemo(() => {
    return templateRepository.filter((template) => {
      if (matchSize) {
        if (
          template.design.width !== store.width ||
          template.design.height !== store.height
        ) {
          return false;
        }
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        template.title.toLowerCase().includes(normalizedQuery) ||
        template.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [matchSize, normalizedQuery, store.height, store.width]);

  const handleSelect = (template: TemplateDefinition) => {
    const designClone = JSON.parse(JSON.stringify(template.design));

    store
      .loadJSON(designClone, true)
      .catch((error) => {
        console.error('Failed to load template design:', error);
      });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        leftIcon={<Search />}
        placeholder="Search templates"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Switch
        checked={matchSize}
        alignIndicator={Alignment.RIGHT}
        onChange={(event) => setMatchSize(event.currentTarget.checked)}
        style={{ marginTop: '8px', marginBottom: '25px' }}
      >
        Show templates with the same size
      </Switch>
      <ImagesGrid
        images={filteredTemplates}
        isLoading={false}
        getPreview={(template) => template.preview}
        onSelect={(template) => handleSelect(template)}
        shadowEnabled
      />
    </div>
  );
};

export const CustomTemplatesPanel = observer(CustomTemplatesPanelComponent);
