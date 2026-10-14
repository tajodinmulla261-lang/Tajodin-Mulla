import React, { useMemo } from 'react';
import { useMatchSync } from '../../hooks/useMatchSync';
import { ScoreboardRenderer } from '../scoreboard/ScoreboardRenderer';
import { BroadcastGraphicOverlay } from './BroadcastGraphicOverlay';
import { ScoreboardLayoutType } from '../../types/match';

export const OverlayView: React.FC = () => {
  const { match, triggerGraphic } = useMatchSync();

  // Parse URL search parameters for OBS / vMix customizations
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      chroma: params.get('chroma') || match.overlayConfig.chromaColor || 'transparent',
      layout: (params.get('layout') as ScoreboardLayoutType) || match.layout,
      pos: params.get('pos') || match.overlayConfig.position || 'top-left',
      scale: parseFloat(params.get('scale') || '1') || match.overlayConfig.scale || 1,
    };
  }, [match.overlayConfig, match.layout]);

  // Background styling for OBS/vMix Chroma Key
  const getBackgroundColor = () => {
    switch (queryParams.chroma) {
      case 'green':
        return '#00FF00';
      case 'magenta':
        return '#FF00FF';
      case 'black':
        return '#000000';
      case 'transparent':
      default:
        return 'transparent';
    }
  };

  // Position class inside 1920x1080 broadcast canvas
  const getPositionClasses = () => {
    switch (queryParams.pos) {
      case 'top-center':
        return 'top-8 inset-x-0 flex justify-center';
      case 'top-right':
        return 'top-8 right-8 flex justify-end';
      case 'bottom-left':
        return 'bottom-8 left-8 flex justify-start';
      case 'bottom-center':
        return 'bottom-8 inset-x-0 flex justify-center';
      case 'bottom-right':
        return 'bottom-8 right-8 flex justify-end';
      case 'top-left':
      default:
        return 'top-8 left-8 flex justify-start';
    }
  };

  return (
    <div
      style={{ backgroundColor: getBackgroundColor() }}
      className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none select-none z-50 font-sans"
    >
      {/* Scoreboard Placement */}
      <div className={`absolute ${getPositionClasses()}`}>
        <ScoreboardRenderer
          match={match}
          layoutOverride={queryParams.layout}
          scale={queryParams.scale}
        />
      </div>

      {/* Broadcast Graphics (Goal Popups, VAR Checks, Sub Boards, Cards) */}
      <BroadcastGraphicOverlay
        match={match}
        onDismiss={() => {
          triggerGraphic({ active: false, type: 'NONE', title: '' });
        }}
      />
    </div>
  );
};
