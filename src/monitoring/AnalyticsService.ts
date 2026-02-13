/**
 * Analytics Configuration
 * Centralized analytics setup with Google Analytics, Segment, and custom tracking
 */

interface AnalyticsConfig {
  googleAnalyticsId?: string;
  enableTracking: boolean;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  sampleRate?: number; // 0-100
  apiEndpoint?: string;
  environment: 'development' | 'staging' | 'production';
}

interface UserProperties {
  userId?: string;
  email?: string;
  accountId?: string;
  role?: string;
  [key: string]: any;
}

interface PageViewData {
  title?: string;
  path?: string;
  referrer?: string;
  searchParams?: Record<string, string>;
}

interface EventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Analytics Service
 * Handles all analytics tracking across the application
 */
class AnalyticsService {
  private config: AnalyticsConfig;
  private userProperties: UserProperties = {};
  private sessionId = this.generateSessionId();
  private pageViewId = this.generatePageViewId();
  private isSampled: boolean;

  constructor(config: AnalyticsConfig) {
    this.config = {
      ...config,
      enableTracking: config.enableTracking ?? true,
      enableErrorTracking: config.enableErrorTracking ?? true,
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
      sampleRate: config.sampleRate ?? 100,
      environment: config.environment ?? 'production',
    };

    // Determine if this session is sampled
    this.isSampled =
      Math.random() * 100 < (this.config.sampleRate || 100);

    this.initializeGoogleAnalytics();
    this.trackPageView();
  }

  /**
   * Initialize Google Analytics 4
   */
  private initializeGoogleAnalytics() {
    if (!this.config.googleAnalyticsId || !this.config.enableTracking) {
      return;
    }

    // Inject Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function gtag(..._args: any[]) {
      (window as any).dataLayer.push(arguments);
    }

    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', this.config.googleAnalyticsId, {
      send_page_view: false, // We'll handle this manually
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      session_sample_rate: this.config.sampleRate,
    });
  }

  /**
   * Set user properties
   */
  public setUserProperties(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties };

    if (window.gtag) {
      window.gtag('set', {
        'user_id': properties.userId,
        'custom_user_id': properties.userId,
        'account_id': properties.accountId,
      });

      // Set user properties
      window.gtag('config', { user_properties: properties });
    }
  }

  /**
   * Identify user
   */
  public identifyUser(userId: string, email?: string) {
    this.setUserProperties({
      userId,
      email,
    });
  }

  /**
   * Track page view
   */
  public trackPageView(data?: PageViewData) {
    const pageData = {
      page_title: data?.title || document.title,
      page_location: window.location.href,
      page_path: data?.path || window.location.pathname,
      referrer: data?.referrer || document.referrer,
      page_view_id: this.pageViewId,
      session_id: this.sessionId,
      ...data?.searchParams,
    };

    if (window.gtag) {
      window.gtag('event', 'page_view', pageData);
    }

    // Send to custom endpoint
    if (this.config.apiEndpoint && this.isSampled) {
      this.sendToBackend('pageview', pageData);
    }

    // Update page view ID for next page
    this.pageViewId = this.generatePageViewId();
  }

  /**
   * Track event
   */
  public trackEvent(data: EventData) {
    const eventData = {
      ...data,
      event_category: data.category,
      event_label: data.label,
      value: data.value,
      session_id: this.sessionId,
      user_id: this.userProperties.userId,
    };

    if (window.gtag) {
      window.gtag('event', data.action, eventData);
    }

    // Send to custom endpoint
    if (this.config.apiEndpoint && this.isSampled) {
      this.sendToBackend('event', eventData);
    }
  }

  /**
   * Track form submission
   */
  public trackFormSubmission(
    formName: string,
    success: boolean,
    value?: number,
    error?: string
  ) {
    this.trackEvent({
      category: 'form',
      action: 'submit',
      label: formName,
      value,
      success,
      error,
    });
  }

  /**
   * Track error
   */
  public trackError(
    message: string,
    context?: Record<string, any>
  ) {
    this.trackEvent({
      category: 'error',
      action: 'exception',
      label: message,
      ...context,
    });
  }

  /**
   * Track click
   */
  public trackClick(element: string, context?: Record<string, any>) {
    this.trackEvent({
      category: 'engagement',
      action: 'click',
      label: element,
      ...context,
    });
  }

  /**
   * Track scroll
   */
  public trackScroll(depth: number) {
    this.trackEvent({
      category: 'engagement',
      action: 'scroll',
      label: `${depth}%`,
      value: depth,
    });
  }

  /**
   * Track file download
   */
  public trackDownload(fileName: string, fileType: string) {
    this.trackEvent({
      category: 'file',
      action: 'download',
      label: fileName,
      file_type: fileType,
    });
  }

  /**
   * Track video engagement
   */
  public trackVideoEngagement(
    videoTitle: string,
    action: 'play' | 'pause' | 'complete',
    progress?: number
  ) {
    this.trackEvent({
      category: 'video',
      action,
      label: videoTitle,
      progress,
    });
  }

  /**
   * Track API call
   */
  public trackApiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number
  ) {
    this.trackEvent({
      category: 'api',
      action: method,
      label: endpoint,
      status_code: statusCode,
      duration_ms: duration,
    });
  }

  /**
   * Send data to backend
   */
  private sendToBackend(type: string, data: any) {
    if (!this.config.apiEndpoint) return;

    const payload = {
      type,
      data,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      sessionId: this.sessionId,
      userId: this.userProperties.userId,
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        this.config.apiEndpoint,
        JSON.stringify(payload)
      );
    } else {
      // Fallback to fetch
      fetch(this.config.apiEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch((err) => {
        if (this.config.environment === 'development') {
          console.error('Analytics submission failed:', err);
        }
      });
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    let sessionId = sessionStorage.getItem('__analytics_session_id');

    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('__analytics_session_id', sessionId);
    }

    return sessionId;
  }

  /**
   * Generate unique page view ID
   */
  private generatePageViewId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get session info
   */
  public getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userProperties.userId,
      isSampled: this.isSampled,
      environment: this.config.environment,
    };
  }

  /**
   * Set consent for analytics
   */
  public setConsent(analyticsConsent: boolean, marketingConsent?: boolean) {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: analyticsConsent ? 'granted' : 'denied',
        marketing_storage: marketingConsent ? 'granted' : 'denied',
      });
    }
  }

  /**
   * Clear user data
   */
  public clearUser() {
    this.userProperties = {};

    if (window.gtag) {
      window.gtag('set', { 'user_id': undefined });
      window.gtag('config', { 'user_id': undefined });
    }
  }
}

/**
 * Initialize analytics
 */
export function initAnalytics(
  config: Partial<AnalyticsConfig>
): AnalyticsService {
  return new AnalyticsService(config as AnalyticsConfig);
}

/**
 * Global analytics instance
 */
let analyticsInstance: AnalyticsService;

export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService({
      enableTracking: true,
      enableErrorTracking: true,
      enablePerformanceTracking: true,
      environment: 'production',
    });
  }
  return analyticsInstance;
}

export default AnalyticsService;
