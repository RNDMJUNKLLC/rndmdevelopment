/**
 * Performance Monitoring Configuration
 * Integrates Web Vitals, Google Analytics, and Error tracking
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Core Web Vitals thresholds (in milliseconds)
 * Green: Good | Yellow: Needs Improvement | Red: Poor
 */
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay (deprecated, using INP)
  INP: { good: 200, needsImprovement: 500 }, // Interaction to Next Paint
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift (unitless)
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
};

/**
 * Performance metrics collection
 */
interface PerformanceMetrics {
  vitals: {
    lcp?: number;
    fid?: number;
    inp?: number;
    cls?: number;
    ttfb?: number;
    fcp?: number;
  };
  navigation: {
    loadTime?: number;
    domContentLoaded?: number;
    resourceSize?: number;
    cacheHits?: number;
  };
  user: {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    connection: string;
    timezone: string;
    language: string;
  };
  page: {
    url: string;
    referrer: string;
    title: string;
    loadId: string;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    vitals: {},
    navigation: {},
    user: {
      deviceType: 'desktop',
      connection: 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    },
    page: {
      url: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
      loadId: this.generateLoadId(),
    },
  };

  private sessionStartTime = Date.now();
  private reported = false;

  constructor(private config: PerformanceConfig) {
    this.detectDeviceType();
    this.detectConnection();
    this.initializeWebVitals();
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitals() {
    // Largest Contentful Paint
    getLCP((metric) => this.handleMetric(metric, 'LCP'));

    // First Input Delay (deprecated, but still useful)
    getFID((metric) => this.handleMetric(metric, 'FID'));

    // Cumulative Layout Shift
    getCLS((metric) => this.handleMetric(metric, 'CLS'));

    // Time to First Byte
    getTTFB((metric) => this.handleMetric(metric, 'TTFB'));

    // First Contentful Paint
    getFCP((metric) => this.handleMetric(metric, 'FCP'));

    // Also track Navigation Timing
    this.trackNavigationTiming();
  }

  /**
   * Handle individual metrics
   */
  private handleMetric(metric: Metric, vitalsKey: string) {
    const key = vitalsKey.toLowerCase() as keyof typeof this.metrics.vitals;
    const value = Math.round(metric.value);

    this.metrics.vitals[key] = value;

    // Log to console in development
    if (this.config.logToConsole) {
      const color = this.getVitalColor(vitalsKey, value);
      console.log(`%c${vitalsKey}: ${value}ms`, `color: ${color}; font-weight: bold;`);
    }

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', vitalsKey, {
        name: metric.name,
        value: value,
        event_category: 'web_vitals',
        event_label: this.metrics.page.loadId,
        non_interaction: true,
      });
    }

    // Send to custom endpoint if configured
    if (this.config.submitEndpoint && metric.isFinal) {
      this.submitMetrics();
    }
  }

  /**
   * Track Navigation Timing API
   */
  private trackNavigationTiming() {
    if ('PerformanceNavigationTiming' in window) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (perfData) {
        const navigationStart = perfData.navigationStart || 0;
        this.metrics.navigation.loadTime = Math.round(perfData.loadEventEnd - navigationStart);
        this.metrics.navigation.domContentLoaded = Math.round(perfData.domContentLoadedEventEnd - navigationStart);

        // Calculate resource size
        const resources = performance.getEntriesByType('resource');
        let totalSize = 0;
        resources.forEach((resource) => {
          const nav = resource as PerformanceResourceTiming;
          if (nav.transferSize) {
            totalSize += nav.transferSize;
          }
        });
        this.metrics.navigation.resourceSize = totalSize;
      }
    }
  }

  /**
   * Detect device type based on viewport
   */
  private detectDeviceType() {
    const width = window.innerWidth;
    if (width < 768) {
      this.metrics.user.deviceType = 'mobile';
    } else if (width < 1024) {
      this.metrics.user.deviceType = 'tablet';
    } else {
      this.metrics.user.deviceType = 'desktop';
    }
  }

  /**
   * Detect connection type
   */
  private detectConnection() {
    const connection = (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      this.metrics.user.connection = connection.effectiveType || 'unknown';
    }
  }

  /**
   * Generate unique load ID
   */
  private generateLoadId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get color based on vital threshold
   */
  private getVitalColor(vital: string, value: number): string {
    const threshold = VITALS_THRESHOLDS[vital as keyof typeof VITALS_THRESHOLDS];

    if (!threshold) return '#666';

    if (value <= threshold.good) return '#0cce6b'; // green
    if (value <= threshold.needsImprovement) return '#ffa400'; // orange
    return '#ff4e42'; // red
  }

  /**
   * Submit metrics to backend
   */
  private submitMetrics() {
    if (!this.reported && this.config.submitEndpoint) {
      this.reported = true;

      const payload = {
        ...this.metrics,
        timestamp: new Date().toISOString(),
        sessionDuration: Date.now() - this.sessionStartTime,
        userAgent: navigator.userAgent,
        screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      };

      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          this.config.submitEndpoint,
          JSON.stringify(payload)
        );
      } else {
        // Fallback to fetch
        fetch(this.config.submitEndpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch((err) => console.error('Failed to submit metrics:', err));
      }
    }
  }

  /**
   * Get current metrics snapshot
   */
  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  /**
   * Generate performance report
   */
  public generateReport(): PerformanceReport {
    return {
      metrics: this.metrics,
      assessment: this.assessPerformance(),
      recommendations: this.getRecommendations(),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Assess overall performance
   */
  private assessPerformance(): PerformanceAssessment {
    const assessment: PerformanceAssessment = {
      overall: 'good',
      vitalsScore: 0,
      details: {},
    };

    let goodCount = 0;
    let vitalCount = 0;

    Object.entries(this.metrics.vitals).forEach(([key, value]) => {
      if (value === undefined) return;

      vitalCount++;
      const threshold = VITALS_THRESHOLDS[key.toUpperCase() as keyof typeof VITALS_THRESHOLDS];

      if (threshold) {
        if (value <= threshold.good) {
          assessment.details[key] = 'good';
          goodCount++;
        } else if (value <= threshold.needsImprovement) {
          assessment.details[key] = 'needs-improvement';
        } else {
          assessment.details[key] = 'poor';
        }
      }
    });

    if (vitalCount > 0) {
      assessment.vitalsScore = Math.round((goodCount / vitalCount) * 100);

      if (assessment.vitalsScore >= 75) {
        assessment.overall = 'good';
      } else if (assessment.vitalsScore >= 50) {
        assessment.overall = 'needs-improvement';
      } else {
        assessment.overall = 'poor';
      }
    }

    return assessment;
  }

  /**
   * Get performance recommendations
   */
  private getRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check LCP
    if (
      this.metrics.vitals.lcp &&
      this.metrics.vitals.lcp > VITALS_THRESHOLDS.LCP.good
    ) {
      recommendations.push(
        'Optimize Largest Contentful Paint: Preload critical images, defer JS, use CDN'
      );
    }

    // Check CLS
    if (
      this.metrics.vitals.cls &&
      this.metrics.vitals.cls > VITALS_THRESHOLDS.CLS.good
    ) {
      recommendations.push(
        'Reduce Cumulative Layout Shift: Set explicit dimensions for images/videos, avoid inserting content above viewport'
      );
    }

    // Check TTFB
    if (
      this.metrics.navigation.loadTime &&
      this.metrics.navigation.loadTime > 3000
    ) {
      recommendations.push(
        'Improve Time to First Byte: Use CDN, optimize server response time, enable caching'
      );
    }

    // Check for large resources
    if (
      this.metrics.navigation.resourceSize &&
      this.metrics.navigation.resourceSize > 2000000
    ) {
      recommendations.push(
        'Reduce total resource size: Enable compression, lazy load images, code split'
      );
    }

    // Mobile specific
    if (this.metrics.user.deviceType === 'mobile') {
      recommendations.push(
        'Mobile optimization: Check Mobile Friendly Test, optimize touch targets, reduce blocking JS'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is good! Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Track custom event
   */
  public trackEvent(name: string, data?: Record<string, any>) {
    if (window.gtag) {
      window.gtag('event', name, {
        ...data,
        page_path: this.metrics.page.url,
        load_id: this.metrics.page.loadId,
      });
    }
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(
  config: Partial<PerformanceConfig> = {}
): PerformanceMonitor {
  const finalConfig: PerformanceConfig = {
    logToConsole: true,
    submitEndpoint: undefined,
    enableErrorTracking: true,
    enableAnalytics: true,
    ...config,
  };

  const monitor = new PerformanceMonitor(finalConfig);

  // Expose globally for debugging
  if (finalConfig.logToConsole) {
    (window as any).__performanceMonitor = monitor;
  }

  return monitor;
}

/**
 * Type definitions
 */
export interface PerformanceConfig {
  logToConsole: boolean;
  submitEndpoint?: string;
  enableErrorTracking: boolean;
  enableAnalytics: boolean;
}

export interface PerformanceAssessment {
  overall: 'good' | 'needs-improvement' | 'poor';
  vitalsScore: number;
  details: Record<string, 'good' | 'needs-improvement' | 'poor'>;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  assessment: PerformanceAssessment;
  recommendations: string[];
  generatedAt: string;
}

export default PerformanceMonitor;
