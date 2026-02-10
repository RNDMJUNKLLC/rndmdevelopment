/**
 * Error Tracking and Monitoring Service
 * Integrates with Sentry for production error tracking
 */

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  page?: string;
  action?: string;
  requestId?: string;
  [key: string]: any;
}

interface ErrorReport {
  message: string;
  error: Error | null;
  context: ErrorContext;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  url: string;
  userAgent: string;
  stackTrace?: string;
}

/**
 * Error Tracking Service
 * Can be integrated with Sentry, LogRocket, or custom backend
 */
class ErrorTracker {
  private context: ErrorContext = {};
  private errorQueue: ErrorReport[] = [];
  private config: ErrorTrackerConfig;
  private sessionId = this.generateSessionId();

  constructor(config: ErrorTrackerConfig) {
    this.config = {
      enableConsoleLogging: true,
      batchSize: 10,
      batchTimeout: 30000,
      maxQueueSize: 100,
      ...config,
    };

    this.setupGlobalErrorHandlers();
    this.startBatchProcessor();
  }

  /**
   * Set context for all error reports
   */
  public setContext(context: Partial<ErrorContext>) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear specific context keys
   */
  public clearContext(keys?: string[]) {
    if (keys) {
      keys.forEach((key) => delete this.context[key]);
    } else {
      this.context = {};
    }
  }

  /**
   * Get current context
   */
  public getContext(): ErrorContext {
    return { ...this.context, sessionId: this.sessionId };
  }

  /**
   * Report an error
   */
  public reportError(
    error: Error | string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
    additionalContext?: ErrorContext
  ) {
    const errorReport = this.createErrorReport(error, severity, additionalContext);
    this.queueError(errorReport);
  }

  /**
   * Report an info message
   */
  public info(message: string, context?: ErrorContext) {
    this.reportError(message, 'info', context);
  }

  /**
   * Report a warning
   */
  public warn(message: string, context?: ErrorContext) {
    this.reportError(message, 'warning', context);
  }

  /**
   * Report an exception
   */
  public captureException(error: Error, context?: ErrorContext) {
    this.reportError(error, 'error', context);
  }

  /**
   * Create error report object
   */
  private createErrorReport(
    error: Error | string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    additionalContext?: ErrorContext
  ): ErrorReport {
    const isError = error instanceof Error;
    const message = isError ? error.message : String(error);
    const stackTrace = isError ? error.stack : undefined;

    return {
      message,
      error: isError ? error : null,
      context: {
        ...this.context,
        ...additionalContext,
      },
      severity,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stackTrace,
    };
  }

  /**
   * Queue error for batch submission
   */
  private queueError(report: ErrorReport) {
    // Log to console in development
    if (this.config.enableConsoleLogging) {
      const color = this.getSeverityColor(report.severity);
      console.error(
        `%c[${report.severity.toUpperCase()}] ${report.message}`,
        `color: ${color}; font-weight: bold;`,
        report.context
      );
    }

    // Add to queue
    if (this.errorQueue.length >= this.config.maxQueueSize!) {
      this.errorQueue.shift(); // Remove oldest if queue is full
    }

    this.errorQueue.push(report);

    // Submit immediately if critical
    if (report.severity === 'critical') {
      this.submitErrors();
    }
  }

  /**
   * Start batch processor for error submission
   */
  private startBatchProcessor() {
    setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.submitErrors();
      }
    }, this.config.batchTimeout);
  }

  /**
   * Submit queued errors to backend
   */
  private async submitErrors() {
    if (this.errorQueue.length === 0) return;

    // Batch submission
    const batch = this.errorQueue.splice(0, this.config.batchSize);

    try {
      if (this.config.submitEndpoint) {
        const response = await fetch(this.config.submitEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            errors: batch,
            count: batch.length,
            timestamp: new Date().toISOString(),
          }),
          keepalive: true,
        });

        if (!response.ok) {
          // Re-queue failed errors
          this.errorQueue.unshift(...batch);
        }
      }

      // Send to Sentry if configured
      if (this.config.sentryDsn && typeof (window as any).Sentry !== 'undefined') {
        batch.forEach((report) => {
          (window as any).Sentry.captureException(report.error || new Error(report.message), {
            level: report.severity,
            contexts: { custom: report.context },
            tags: {
              page: report.context.page,
              sessionId: this.sessionId,
            },
          });
        });
      }
    } catch (error) {
      console.error('Failed to submit error batch:', error);
      // Re-queue failed errors
      this.errorQueue.unshift(...batch);
    }
  }

  /**
   * Get severity color for console logging
   */
  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      info: '#1976d2',
      warning: '#ffa500',
      error: '#d32f2f',
      critical: '#b71c1c',
    };
    return colors[severity] || '#666';
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), 'error', {
        type: 'uncaughtError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'error',
        {
          type: 'unhandledRejection',
        }
      );
    });

    // Handle console errors
    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError.apply(console, args);

      if (args[0] instanceof Error) {
        this.reportError(args[0], 'error', {
          source: 'console.error',
        });
      }
    };
  }

  /**
   * Get error statistics
   */
  public getStatistics() {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0,
      },
      byType: {} as Record<string, number>,
    };

    this.errorQueue.forEach((report) => {
      stats.bySeverity[report.severity]++;

      const type = report.context.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error queue
   */
  public clearQueue() {
    this.errorQueue = [];
  }

  /**
   * Force submit all queued errors
   */
  public flush() {
    return this.submitErrors();
  }
}

/**
 * Initialize error tracking
 */
export function initErrorTracking(
  config: Partial<ErrorTrackerConfig> = {}
): ErrorTracker {
  return new ErrorTracker(config);
}

/**
 * Type definitions
 */
export interface ErrorTrackerConfig {
  submitEndpoint?: string;
  sentryDsn?: string;
  enableConsoleLogging?: boolean;
  batchSize?: number;
  batchTimeout?: number;
  maxQueueSize?: number;
}

export default ErrorTracker;
