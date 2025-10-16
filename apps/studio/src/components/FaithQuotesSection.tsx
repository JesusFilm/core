/* eslint-disable import/order, sort-imports */
import React, { useMemo, useState } from 'react';
import { Button, Tab, Tabs } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';
import { SectionTab, type Section } from 'polotno/side-panel';
import type { StoreType } from 'polotno/model/store';
import {
  faithVoiceQuotes,
  feltNeedCategories,
  type FaithVoiceQuote,
  type FeltNeedCategory,
  type FeltNeedQuote
} from '../data/quotes';

interface QuotePanelProps {
  store: StoreType;
}

type QuoteTab = 'bible' | 'voices';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const scrollAreaStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  gap: '12px',
  display: 'flex',
  flexDirection: 'column',
};

const quoteCardStyle: React.CSSProperties = {
  borderRadius: '8px',
  border: '1px solid #d9e2ec',
  padding: '12px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const quoteTextStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.5,
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const quoteAttributionStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  margin: 0,
  color: '#475569',
};

const categoryButtonRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  margin: '12px 0 4px',
};

const sectionSummaryStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#475569',
  marginBottom: '8px',
};

const FaithQuotesPanel = observer(({ store }: QuotePanelProps) => {
  const [activeTab, setActiveTab] = useState<QuoteTab>('bible');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    feltNeedCategories[0]?.id ?? ''
  );

  const activeCategory: FeltNeedCategory | undefined = useMemo(
    () => feltNeedCategories.find((category) => category.id === activeCategoryId),
    [activeCategoryId]
  );

  const addQuoteToCanvas = (text: string, attribution?: string) => {
    const page = store.activePage || store.pages[0];

    if (!page) {
      return;
    }

    const width = Math.min(store.width * 0.75, 720);
    const x = (store.width - width) / 2;
    const y = store.height * 0.25;
    const fullText = attribution ? `${text}\n${attribution}` : text;

    void store.history.transaction(() => {
      const element = page.addElement({
        type: 'text',
        text: fullText,
        name: 'Quote',
        fontFamily: 'Roboto',
        fontSize: 38,
        align: 'center',
        width,
        x,
        y,
        lineHeight: 1.3,
        fill: '#1f2937',
      });

      if (element) {
        store.selectElements([element.id]);
      }
    });
  };

  const renderBibleQuotes = () => {
    if (!activeCategory) {
      return null;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={categoryButtonRowStyle}>
          {feltNeedCategories.map((category) => (
            <Button
              key={category.id}
              small
              minimal
              intent={category.id === activeCategoryId ? 'primary' : 'none'}
              onClick={() => setActiveCategoryId(category.id)}
              style={{
                border:
                  category.id === activeCategoryId
                    ? '1px solid rgba(45, 112, 253, 0.6)'
                    : '1px solid #d9e2ec',
                backgroundColor:
                  category.id === activeCategoryId ? 'rgba(45, 112, 253, 0.08)' : '#f8fafc',
                color: '#1f2937',
              }}
            >
              {category.title}
            </Button>
          ))}
        </div>

        <div>
          <div style={sectionTitleStyle}>{activeCategory.title}</div>
          <div style={sectionSummaryStyle}>{activeCategory.summary}</div>
        </div>

        {activeCategory.quotes.map((quote: FeltNeedQuote, index: number) => (
          <div key={`${activeCategory.id}-${index}`} style={quoteCardStyle}>
            <p style={quoteTextStyle}>{quote.text}</p>
            <p style={quoteAttributionStyle}>— {quote.reference}</p>
            <div>
              <Button
                small
                intent="primary"
                onClick={() => addQuoteToCanvas(quote.text, `— ${quote.reference}`)}
              >
                Add to canvas
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFaithVoices = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {faithVoiceQuotes.map((quote: FaithVoiceQuote, index: number) => {
        const attribution = quote.source
          ? `${quote.author}, ${quote.source}`
          : quote.author;

        return (
          <div key={`faith-voice-${index}`} style={quoteCardStyle}>
            <p style={quoteTextStyle}>{quote.text}</p>
            <p style={quoteAttributionStyle}>— {attribution}</p>
            <div>
              <Button
                small
                intent="primary"
                onClick={() => addQuoteToCanvas(quote.text, `— ${attribution}`)}
              >
                Add to canvas
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={containerStyle}>
      <Tabs
        id="faith-quotes-tabs"
        large
        onChange={(newTabId) => setActiveTab(newTabId as QuoteTab)}
        selectedTabId={activeTab}
      >
        <Tab id="bible" title="Bible Verses by Felt Need" />
        <Tab id="voices" title="Faith Voices" />
      </Tabs>

      <div style={scrollAreaStyle}>
        {activeTab === 'bible' ? renderBibleQuotes() : renderFaithVoices()}
      </div>
    </div>
  );
});

const FaithQuotesTab = observer(
  ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <SectionTab
      active={active}
      name="Faith Quotes"
      onClick={onClick}
    />
  )
);

export const FaithQuotesSection: Section = {
  name: 'faith-quotes',
  Tab: FaithQuotesTab,
  Panel: FaithQuotesPanel,
};
