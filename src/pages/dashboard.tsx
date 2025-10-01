/**
 * Dashboard Page - Integration Example
 * 
 * Shows how to integrate the ExpertsDashboard component
 * into a Next.js page or React application.
 */

import React from 'react';
import { ExpertsDashboard } from '../components/ExpertsDashboard';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Expert Recommendation System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                Settings
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                Export
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Monitor the performance and effectiveness of your expert recommendation system.
          </p>
        </div>

        {/* Dashboard Component */}
        <ExpertsDashboard 
          refreshInterval={30} // Auto-refresh every 30 seconds
          className="mb-8"
        />

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How to Interpret These Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Acceptance Rate</h4>
              <p className="text-sm text-gray-600">
                Percentage of expert recommendations that users accepted. A higher rate indicates 
                better matching quality. Target: 70% or higher.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Latency Metrics</h4>
              <p className="text-sm text-gray-600">
                Response times for expert recommendations. P50 is median, P95 is 95th percentile. 
                Target: P95 under 500ms for good user experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Rejection Reasons</h4>
              <p className="text-sm text-gray-600">
                Common reasons why users decline recommendations. Use this data to improve 
                matching algorithms or expert profiles.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Popular Queries</h4>
              <p className="text-sm text-gray-600">
                Most frequent search terms and their success rates. Helps identify areas 
                where you may need more expert coverage.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
