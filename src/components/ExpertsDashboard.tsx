/**
 * Expert Statistics Dashboard Component
 * 
 * Displays key metrics from the expert recommendation system including
 * acceptance rates, latency metrics, and top rejection reasons in an
 * elegant card-based layout.
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Clock, X, Users, Activity } from 'lucide-react';

// Types for the statistics API response
interface LatencyMetrics {
  p50: number;
  p95: number;
  average: number;
  samples: number;
}

interface RejectReason {
  reason: string;
  count: number;
  percentage: number;
}

interface QueryStats {
  query: string;
  count: number;
  acceptanceRate: number;
  avgLatency?: number;
}

interface ExpertStats {
  acceptanceRate: number;
  latency: LatencyMetrics;
  topRejectReasons: RejectReason[];
  topQueries: QueryStats[];
  metadata: {
    totalFeedback: number;
    totalQueries: number;
    dateRange: {
      from: string;
      to: string;
    };
    generatedAt: string;
  };
}

// Props for the dashboard component
interface ExpertsDashboardProps {
  refreshInterval?: number; // Auto-refresh interval in seconds
  className?: string;
}

// Loading skeleton component
const MetricSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-full"></div>
  </div>
);

// Error display component
const ErrorDisplay: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center">
      <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
      <span className="text-sm text-red-800">Failed to load statistics: {error}</span>
    </div>
    <button
      onClick={onRetry}
      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
    >
      Try again
    </button>
  </div>
);

// Individual metric card component
const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'blue' | 'orange' | 'red';
}> = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600'
  };

  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '';

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <span className={`ml-2 text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trendIcon}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

// Rejection reasons list component
const RejectionReasonsList: React.FC<{ reasons: RejectReason[] }> = ({ reasons }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-900">Top Rejection Reasons</h3>
      <X className="h-5 w-5 text-gray-400" />
    </div>
    <div className="space-y-3">
      {reasons.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No rejection data available</p>
      ) : (
        reasons.map((reason, index) => (
          <div key={reason.reason} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-medium mr-3">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={reason.reason}>
                {reason.reason}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{reason.count}</span>
              <span className="text-xs text-gray-400">({(reason.percentage * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Popular queries component
const PopularQueries: React.FC<{ queries: QueryStats[] }> = ({ queries }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-900">Popular Queries</h3>
      <Users className="h-5 w-5 text-gray-400" />
    </div>
    <div className="space-y-4">
      {queries.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No query data available</p>
      ) : (
        queries.map((query, index) => (
          <div key={query.query} className="border-l-4 border-blue-200 pl-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={query.query}>
                {query.query}
              </span>
              <span className="text-xs text-gray-500">{query.count} requests</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Success: {(query.acceptanceRate * 100).toFixed(1)}%</span>
              {query.avgLatency && (
                <span>Avg: {query.avgLatency}ms</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Main dashboard component
export const ExpertsDashboard: React.FC<ExpertsDashboardProps> = ({ 
  refreshInterval = 30,
  className = ''
}) => {
  const [stats, setStats] = useState<ExpertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch statistics from the API
  const fetchStats = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/stats/experts?limit=5');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ExpertStats = await response.json();
      setStats(data);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Failed to fetch expert statistics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and auto-refresh setup
  useEffect(() => {
    fetchStats();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Manual refresh handler
  const handleRefresh = () => {
    setLoading(true);
    fetchStats();
  };

  // Format percentage for display
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Format latency for display
  const formatLatency = (value: number) => `${value}ms`;

  // Determine acceptance rate color
  const getAcceptanceRateColor = (rate: number): 'green' | 'orange' | 'red' => {
    if (rate >= 0.8) return 'green';
    if (rate >= 0.6) return 'orange';
    return 'red';
  };

  // Determine latency color based on P95
  const getLatencyColor = (p95: number): 'green' | 'orange' | 'red' => {
    if (p95 <= 200) return 'green';
    if (p95 <= 500) return 'orange';
    return 'red';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expert Statistics</h2>
          <p className="text-sm text-gray-500">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Activity className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorDisplay error={error} onRetry={handleRefresh} />
      )}

      {/* Loading State */}
      {loading && !stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <MetricSkeleton />
            </div>
          ))}
        </div>
      )}

      {/* Main Metrics Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Acceptance Rate */}
            <MetricCard
              title="Acceptance Rate"
              value={formatPercentage(stats.acceptanceRate)}
              subtitle={`${stats.metadata.totalFeedback} total responses`}
              icon={<TrendingUp className="h-5 w-5" />}
              color={getAcceptanceRateColor(stats.acceptanceRate)}
              trend={stats.acceptanceRate >= 0.7 ? 'up' : stats.acceptanceRate >= 0.5 ? 'neutral' : 'down'}
            />

            {/* P50 Latency */}
            <MetricCard
              title="P50 Latency"
              value={formatLatency(stats.latency.p50)}
              subtitle="Median response time"
              icon={<Clock className="h-5 w-5" />}
              color={getLatencyColor(stats.latency.p50)}
            />

            {/* P95 Latency */}
            <MetricCard
              title="P95 Latency"
              value={formatLatency(stats.latency.p95)}
              subtitle="95th percentile"
              icon={<Clock className="h-5 w-5" />}
              color={getLatencyColor(stats.latency.p95)}
            />

            {/* Total Queries */}
            <MetricCard
              title="Unique Queries"
              value={stats.metadata.totalQueries.toString()}
              subtitle={`${formatLatency(stats.latency.average)} avg latency`}
              icon={<Users className="h-5 w-5" />}
              color="blue"
            />
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rejection Reasons */}
            <RejectionReasonsList reasons={stats.topRejectReasons} />

            {/* Popular Queries */}
            <PopularQueries queries={stats.topQueries} />
          </div>

          {/* Summary Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Data from {new Date(stats.metadata.dateRange.from).toLocaleDateString()} to{' '}
                {new Date(stats.metadata.dateRange.to).toLocaleDateString()}
              </span>
              <span>
                {stats.latency.samples} samples with latency data
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpertsDashboard;
