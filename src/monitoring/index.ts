/**
 * Monitoring & Analytics Services Index
 * Centralized exports for all monitoring, analytics, error tracking, and performance monitoring
 */

import PerformanceMonitor, {
  initPerformanceMonitoring,
  type PerformanceConfig,
  type PerformanceAssessment,
  type PerformanceReport,
} from './PerformanceMonitor';

import ErrorTracker, { initErrorTracking, type ErrorTrackerConfig } from './ErrorTracker';

import AnalyticsService, { initAnalytics, getAnalytics } from './AnalyticsService';

export {
  PerformanceMonitor,
  initPerformanceMonitoring,
  type PerformanceConfig,
  type PerformanceAssessment,
  type PerformanceReport,
};

export { ErrorTracker, initErrorTracking, type ErrorTrackerConfig };

export { AnalyticsService, initAnalytics, getAnalytics };

/**
 * Combined initialization function
 * Initializes all monitoring services in one call
 */
export function initializeMonitoring(config: MonitoringConfig) {
  const services: Record<string, any> = {};

  // Initialize Performance Monitor
  if (config.performance) {
    services.performance = initPerformanceMonitoring(config.performance);
  }

  // Initialize Error Tracker
  if (config.errorTracking) {
    services.errorTracking = initErrorTracking(config.errorTracking);
  }

  // Initialize Analytics
  if (config.analytics) {
    services.analytics = initAnalytics(config.analytics);
  }

  return services;
}

/**
 * Configuration for all monitoring services
 */
export interface MonitoringConfig {
  performance?: any;
  errorTracking?: any;
  analytics?: any;
}

export default {
  initializeMonitoring,
};
