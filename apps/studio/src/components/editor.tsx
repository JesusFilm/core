import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { unstable_setAnimationsEnabled } from 'polotno/config';
import { createStore } from 'polotno/model/store';
import { PagesTimeline } from 'polotno/pages-timeline';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import React, { useEffect } from 'react';

// Enable animations
unstable_setAnimationsEnabled(true);

const initialState = `{"width":1100,"height":600,"fonts":[],"pages":[{"id":"w7fbBNiwJP","children":[{"id":"bJknTigMO5","type":"text","name":"","opacity":1,"visible":true,"selectable":true,"removable":true,"alwaysOnTop":false,"showInExport":true,"x":382.64917811216264,"y":288.06050717606604,"width":334.7016437756747,"height":63,"rotation":0,"animations":[],"blurEnabled":false,"blurRadius":10,"brightnessEnabled":false,"brightness":0,"sepiaEnabled":false,"grayscaleEnabled":false,"filters":{},"shadowEnabled":false,"shadowBlur":5,"shadowOffsetX":0,"shadowOffsetY":0,"shadowColor":"black","shadowOpacity":1,"draggable":true,"resizable":true,"contentEditable":true,"styleEditable":true,"text":"Adventure","placeholder":"","fontSize":51.36334494207179,"fontFamily":"Rock Salt","fontStyle":"italic","fontWeight":"normal","textDecoration":"","fill":"rgba(0,0,0,1)","align":"center","verticalAlign":"top","strokeWidth":0,"stroke":"black","lineHeight":1.2,"letterSpacing":0,"backgroundEnabled":false,"backgroundColor":"#7ED321","backgroundOpacity":1,"backgroundCornerRadius":0.5,"backgroundPadding":0.5},{"id":"m-FOpeqqqN","type":"text","name":"","opacity":1,"visible":true,"selectable":true,"removable":true,"alwaysOnTop":false,"showInExport":true,"x":429.31035134300527,"y":250.3034788934478,"width":106.65521542160857,"height":33,"rotation":0,"animations":[],"blurEnabled":false,"blurRadius":10,"brightnessEnabled":false,"brightness":0,"sepiaEnabled":false,"grayscaleEnabled":false,"filters":{},"shadowEnabled":false,"shadowBlur":5,"shadowOffsetX":0,"shadowOffsetY":0,"shadowColor":"black","shadowOpacity":1,"draggable":true,"resizable":true,"contentEditable":true,"styleEditable":true,"text":"Life is an ","placeholder":"","fontSize":26.165954672341524,"fontFamily":"Quattrocento","fontStyle":"normal","fontWeight":"bold","textDecoration":"","fill":"rgba(0,0,0,1)","align":"left","verticalAlign":"top","strokeWidth":0,"stroke":"black","lineHeight":1.2,"letterSpacing":0,"backgroundEnabled":false,"backgroundColor":"#7ED321","backgroundOpacity":1,"backgroundCornerRadius":0.5,"backgroundPadding":0.5}],"width":"auto","height":"auto","background":"white","bleed":0,"duration":5000},{"id":"hp97ZkZDYa","children":[],"width":"auto","height":"auto","background":"white","bleed":0,"duration":5000}],"audios":[],"unit":"px","dpi":72}`;

const store = createStore({
  key: 'nFA5H9elEytDyPyvKL7T', // you can create it here: https://polotno.com/cabinet/
  // you can hide back-link on a paid license
  // but it will be good if you can keep it for Polotno project support
  showCredit: true,
});

export const Editor = () => {
  useEffect(() => {
    const loadDesign = async () => {
      const getDefaultDesign = () => JSON.parse(initialState);

      if (typeof window !== 'undefined') {
        const storedDesign = window.localStorage.getItem(
          'studio-polotno-design'
        );
        try {
          if (storedDesign) {
            await store.loadJSON(JSON.parse(storedDesign));
          } else {
            await store.loadJSON(getDefaultDesign());
          }
        } catch (error) {
          console.error('Failed to load design for Polotno editor:', error);
          await store.loadJSON(getDefaultDesign());
        } finally {
          window.localStorage.removeItem('studio-polotno-design');
          window.localStorage.removeItem('studio-polotno-design-meta');
        }
      } else {
        await store.loadJSON(getDefaultDesign());
      }

      if (store.pages.length === 0) {
        store.addPage();
      }
    };

    void loadDesign();
  }, []);

  return (
    <>
    <div className="bp5-navbar" 
        style={{  position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
        >
          <img
            src="/jesusfilm-sign.svg"
            alt="Jesus Film Project"
            style={{ width: 'auto', height: 'auto', maxHeight: '24px' }}
          />
          <h1 style={{ fontSize: '21px', fontWeight: 'bold', color: '#333', margin: 0 }}>Studio</h1>
        </div>
    <PolotnoContainer style={{ width: '100vw', height: '100vh', paddingTop: '51px' }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css"
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          body .polotno-workspace-inner .polotno-page-container:after {
          content:'';
            background: #E8E8E8 !important;
            width: 200px !important;
            height: 30px !important;
            bottom: 0 !important;
            right: 0 !important;
            position: absolute !important;  
            z-index: 1000 !important;
          }
        `
      }} />
      <SidePanelWrap>
        {/* <SidePanel store={store} /> */}
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar store={store} downloadButtonEnabled />
        <Workspace store={store} />
        <ZoomButtons store={store} />
        <PagesTimeline store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
    </>
  );
};

export default Editor;
