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
export interface MonitoringServices {
  performance?: ReturnType<typeof initPerformanceMonitoring>;
  errorTracking?: ReturnType<typeof initErrorTracking>;
  analytics?: ReturnType<typeof initAnalytics>;
}

export function initializeMonitoring(config: MonitoringConfig): MonitoringServices {
  const services: MonitoringServices = {};

  if (config.performance) {
    services.performance = initPerformanceMonitoring(config.performance);
  }

  if (config.errorTracking) {
    services.errorTracking = initErrorTracking(config.errorTracking);
  }

  if (config.analytics) {
    services.analytics = initAnalytics(config.analytics);
  }

  return services;
}

/**
 * Configuration for all monitoring services
 */
export interface MonitoringConfig {
  performance?: PerformanceConfig;
  errorTracking?: ErrorTrackerConfig;
  analytics?: Parameters<typeof initAnalytics>[0];
}

export default {
  initializeMonitoring,
};
