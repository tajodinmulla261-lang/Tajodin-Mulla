import React from 'react';
import { MatchState, ScoreboardLayoutType } from '../../types/match';
import { PremierLayout } from './PremierLayout';
import { ChampionsLayout } from './ChampionsLayout';
import { InternationalLayout } from './InternationalLayout';
import { MatrixLedLayout } from './MatrixLedLayout';
import { TacticalLowerLayout } from './TacticalLowerLayout';
import { MinimalBugLayout } from './MinimalBugLayout';

interface ScoreboardRendererProps {
  match: MatchState;
  layoutOverride?: ScoreboardLayoutType;
  scale?: number;
}

export const ScoreboardRenderer: React.FC<ScoreboardRendererProps> = ({
  match,
  layoutOverride,
  scale = 1,
}) => {
  const activeLayout = layoutOverride || match.layout;

  switch (activeLayout) {
    case 'champions':
      return <ChampionsLayout match={match} scale={scale} />;
    case 'international':
      return <InternationalLayout match={match} scale={scale} />;
    case 'matrix_led':
      return <MatrixLedLayout match={match} scale={scale} />;
    case 'tactical_lower':
      return <TacticalLowerLayout match={match} scale={scale} />;
    case 'minimal_bug':
      return <MinimalBugLayout match={match} scale={scale} />;
    case 'premier':
    default:
      return <PremierLayout match={match} scale={scale} />;
  }
};
