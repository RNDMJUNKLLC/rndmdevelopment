/**
 * Generate Sitemap XML for SEO
 * Run: node scripts/generate-sitemap.js or npm run seo:sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://rndm.dev';
const OUTPUT_DIR = path.resolve(__dirname, '../public');

// Define all routes with their priority and change frequency
const routes = [
  {
    path: '',
    priority: 1.0,
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/about',
    priority: 0.8,
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/services',
    priority: 0.9,
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/contact',
    priority: 0.8,
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/privacy-policy',
    priority: 0.5,
    changefreq: 'yearly',
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    path: '/terms-of-service',
    priority: 0.5,
    changefreq: 'yearly',
    lastmod: new Date().toISOString().split('T')[0],
  },
];

// Generate XML sitemap
const generateSitemap = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '         xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
  xml += '         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  routes.forEach((route) => {
    const url = `${SITE_URL}${route.path}`;
    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';

  return xml;
};

// Generate sitemap index (for multiple sitemaps in future)
const generateSitemapIndex = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml +=
    '  <sitemap>\n' +
    '    <loc>' +
    SITE_URL +
    '/sitemap.xml</loc>\n' +
    '    <lastmod>' +
    new Date().toISOString().split('T')[0] +
    '</lastmod>\n' +
    '  </sitemap>\n';
  xml += '</sitemapindex>';

  return xml;
};

// Generate robots.txt
const generateRobotsTxt = () => {
  return `# Robot Meta Data
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?*sort=
Disallow: /~*

# Google
User-agent: Googlebot
Allow: /

# Bing
User-agent: Bingbot
Allow: /

# Common robots
User-agent: AhrefsBot
Crawl-delay: 1

User-agent: SemrushBot
Crawl-delay: 1

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Comment: Crawl delay and request time
User-agent: *
Crawl-delay: 1

# Security - disallow sensitive endpoints
Allow: /api/public/*
Disallow: /api/private/*
Disallow: /.env*
Disallow: /config/
Disallow: /node_modules/
Disallow: /.git
`;
};

// Generate site.webmanifest
const generateWebManifest = () => {
  return JSON.stringify(
    {
      name: 'RNDM Development',
      short_name: 'RNDM',
      description: 'Professional web development and project management services',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0f172a',
      orientation: 'portrait-primary',
      scope: '/',
      icons: [
        {
          src: '/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      categories: ['business', 'technology'],
      screenshots: [
        {
          src: '/screenshot-1.png',
          sizes: '640x480',
          type: 'image/png',
          form_factor: 'narrow',
        },
        {
          src: '/screenshot-2.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
        },
      ],
      shortcuts: [
        {
          name: 'Contact Us',
          short_name: 'Contact',
          description: 'Get in touch with our team',
          url: '/contact',
          icons: [{ src: '/icon-contact.png', sizes: '192x192' }],
        },
      ],
    },
    null,
    2
  );
};

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Write files
try {
  // Write sitemap.xml
  const sitemapPath = path.join(OUTPUT_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, generateSitemap(), 'utf-8');
  console.log(`✓ Generated sitemap.xml (${routes.length} URLs)`);

  // Write sitemap-index.xml (for future use)
  const sitemapIndexPath = path.join(OUTPUT_DIR, 'sitemap-index.xml');
  fs.writeFileSync(sitemapIndexPath, generateSitemapIndex(), 'utf-8');
  console.log('✓ Generated sitemap-index.xml');

  // Write robots.txt
  const robotsPath = path.join(OUTPUT_DIR, 'robots.txt');
  fs.writeFileSync(robotsPath, generateRobotsTxt(), 'utf-8');
  console.log('✓ Generated robots.txt');

  // Write site.webmanifest
  const webManifestPath = path.join(OUTPUT_DIR, 'site.webmanifest');
  fs.writeFileSync(webManifestPath, generateWebManifest(), 'utf-8');
  console.log('✓ Generated site.webmanifest');

  console.log('\n✅ SEO files generated successfully!');
  console.log(`\nGenerated files:`);
  console.log(`  📄 ${sitemapPath}`);
  console.log(`  📄 ${sitemapIndexPath}`);
  console.log(`  📄 ${robotsPath}`);
  console.log(`  📄 ${webManifestPath}`);
  console.log(
    '\nNext steps:\n' +
      '1. Submit sitemap.xml to Google Search Console\n' +
      '2. Add sitemap URL to robots.txt in search console\n' +
      '3. Update manifest icons paths as needed\n' +
      '4. Add Open Graph images to public folder'
  );
} catch (error) {
  console.error('❌ Error generating SEO files:', error);
  process.exit(1);
}
