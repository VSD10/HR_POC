import React from 'react';
import { WelcomeBanner } from '../dashboard/WelcomeBanner';
import { MetricCards } from '../dashboard/MetricCards';
import { VelocityChart } from '../dashboard/VelocityChart';
import { AttentionQueue } from '../dashboard/AttentionQueue';
import { AIOperationsCard } from '../dashboard/AIOperationsCard';
import { ProcessInsightsCard } from '../dashboard/ProcessInsightsCard';
import { CategoryBreakdownCard } from '../dashboard/CategoryBreakdownCard';
import { RecentActivityFeed } from '../dashboard/RecentActivityFeed';
import {
  DashboardMetrics,
  VelocityData,
  RequestItem,
  InsightItem,
  CategoryVolume,
  ActivityEvent
} from '../../types/hr';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  velocity: VelocityData;
  activeVelocityRange: '7D' | '30D' | '90D';
  onChangeVelocityRange: (range: '7D' | '30D' | '90D') => void;
  urgentRequests: RequestItem[];
  insights: InsightItem[];
  categories: CategoryVolume[];
  activities: ActivityEvent[];
  onOpenNewAction: () => void;
  onReviewRequest: (item: RequestItem) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  velocity,
  activeVelocityRange,
  onChangeVelocityRange,
  urgentRequests,
  insights,
  categories,
  activities,
  onOpenNewAction,
  onReviewRequest,
  onNavigateTab
}) => {
  return (
    <main className="flex-1 flex flex-col gap-6">
      {/* 1. Welcome Banner */}
      <WelcomeBanner
        onNewAction={onOpenNewAction}
        avgSla={metrics.avgSla}
        resolvedCount={metrics.resolvedOvernight}
        urgentCount={urgentRequests.length}
      />

      {/* 2. Bento KPI Tiles */}
      <MetricCards
        metrics={metrics}
        onFilterUrgent={() => onNavigateTab('requests')}
        onNavigateActions={() => onNavigateTab('hr-actions')}
        onNavigateRequests={() => onNavigateTab('requests')}
      />

      {/* 3. Main Velocity Chart & Attention Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <VelocityChart
          velocity={velocity}
          activeRange={activeVelocityRange}
          onChangeRange={onChangeVelocityRange}
        />
        <AttentionQueue
          items={urgentRequests}
          onReview={onReviewRequest}
          onViewAll={() => onNavigateTab('requests')}
        />
      </div>

      {/* 4. AI Operations Telemetry Panel */}
      <AIOperationsCard
        metrics={metrics}
        onNavigateTriage={() => onNavigateTab('ai-triage')}
        onNavigateCopilot={() => onNavigateTab('ai-assistance')}
        onNavigateDeliverables={() => onNavigateTab('deliverables')}
      />

      {/* 5. Lower Grid: Process Improvement & Request Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessInsightsCard
          insights={insights}
          onViewAll={() => onNavigateTab('insights')}
        />
        <CategoryBreakdownCard
          categories={categories}
          onSelectCategory={() => onNavigateTab('requests')}
        />
      </div>

      {/* 6. Recent Activity Feed */}
      <RecentActivityFeed
        activities={activities}
        onViewAll={() => onNavigateTab('reports')}
      />
    </main>
  );
};
