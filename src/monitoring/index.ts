/**
 * Monitoring & Analytics Services Index
 * Centralized exports for all monitoring, analytics, error tracking, and performance monitoring
 */

export { default as PerformanceMonitor, initPerformanceMonitoring } from './PerformanceMonitor';
export type { PerformanceConfig, PerformanceAssessment, PerformanceReport, PerformanceMetrics } from './PerformanceMonitor';

export { default as ErrorTracker, initErrorTracking } from './ErrorTracker';
export type { ErrorTrackerConfig } from './ErrorTracker';

export { default as AnalyticsService, initAnalytics, getAnalytics } from './AnalyticsService';
export type {} from './AnalyticsService';

/**
 * Combined initialization function
 * Initializes all monitoring services in one call
 */
export function initializeMonitoring(config: MonitoringConfig) {
  const services = {};

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
