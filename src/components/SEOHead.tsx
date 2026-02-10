import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Metadata Component
 * Handles all meta tags, structured data, and SEO optimization
 * 
 * Usage:
 * <SEOHead
 *   title="Contact Us"
 *   description="Get in touch with RNDM Development for your project needs"
 *   image="/og-image.png"
 *   path="/contact"
 * />
 */

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  path?: string;
  type?: 'website' | 'article' | 'business.business';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

const DEFAULT_TITLE = 'RNDM Development | Web Solutions & Project Management';
const DEFAULT_DESCRIPTION =
  'Professional web development and project inquiry management. Get expert solutions for your business needs.';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_URL = 'https://rndm.dev';
const TWITTER_HANDLE = '@RNDMDevelopment';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = 'web development, project management, inquiry form, business solutions',
  image = DEFAULT_IMAGE,
  imageAlt = 'RNDM Development',
  path = '/',
  type = 'website',
  author = 'RNDM Development',
  publishedDate,
  modifiedDate,
}) => {
  const fullUrl = `${SITE_URL}${path}`;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const fullTitle = title.includes('RNDM') ? title : `${title} | RNDM Development`;

  // Schema.org structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RNDM Development',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      'https://twitter.com/RNDMDevelopment',
      'https://github.com/RNDMJUNKLLC',
      'https://linkedin.com/company/rndm-development',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Support',
      email: 'info@rndm.dev',
    },
  };

  const pageSchema =
    type === 'article'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: description,
          image: fullImageUrl,
          author: { '@type': 'Person', name: author },
          datePublished: publishedDate,
          dateModified: modifiedDate || publishedDate,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: fullTitle,
          description: description,
          url: fullUrl,
          image: fullImageUrl,
          publisher: organizationSchema,
        };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content="RNDM Development" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:creator" content={TWITTER_HANDLE} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0f172a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Robots Meta */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Preconnect to External Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://firebase.googleapis.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>

      {/* Sitemap and RSS */}
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

      {/* Accessibility */}
      <meta name="description" lang="en-US" content={description} />
      <html lang="en-US" />
    </Helmet>
  );
};

/**
 * Default SEO Props for Different Pages
 */
export const SEO_PAGES = {
  home: {
    title: 'Professional Web Development Solutions',
    description:
      'RNDM Development offers expert web development and project management services. Transform your ideas into reality with our team.',
    keywords: 'web development, web design, project management, business solutions, custom software',
    path: '/',
  },
  about: {
    title: 'About RNDM Development',
    description: 'Learn about RNDM Development team, our mission, values, and expertise in web development.',
    keywords: 'about, team, mission, values, experience, expertise',
    path: '/about',
  },
  services: {
    title: 'Our Web Development Services',
    description: 'Explore our comprehensive web development services including design, development, and maintenance.',
    keywords: 'services, web development, design, development, consulting, maintenance',
    path: '/services',
  },
  contact: {
    title: 'Contact RNDM Development',
    description: 'Get in touch with us for your next project. Submit your inquiry and we will get back to you shortly.',
    keywords: 'contact, inquiry, support, email, phone, business inquiry',
    path: '/contact',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Read our privacy policy to understand how we handle your personal data.',
    keywords: 'privacy, policy, data protection',
    path: '/privacy-policy',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Review our terms of service and conditions of use.',
    keywords: 'terms, service, conditions, legal',
    path: '/terms-of-service',
  },
};

/**
 * Open Graph Image Dimensions: 1200x630px
 * Twitter Card Image: 1024x512px or higher
 * Favicon: 16x16, 32x32, and 192x192 px
 */

export default SEOHead;
