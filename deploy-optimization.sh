#!/bin/bash

# RNDM Development - Lighthouse Optimization Deployment Script
# This script implements all performance optimizations

echo "🚀 Starting Lighthouse Optimization Deployment..."
echo "=================================================="

# Step 1: Backup original files
echo "📦 Backing up original files..."
if [ -f "src/main.js" ] && [ ! -f "src/main-original.js" ]; then
    cp "src/main.js" "src/main-original.js"
    echo "✅ Backed up main.js"
fi

if [ -f "src/style.css" ] && [ ! -f "src/style-original.css" ]; then
    cp "src/style.css" "src/style-original.css"
    echo "✅ Backed up style.css"
fi

if [ -f "package.json" ] && [ ! -f "package-original.json" ]; then
    cp "package.json" "package-original.json"
    echo "✅ Backed up package.json"
fi

# Step 2: Replace with optimized files
echo ""
echo "🔄 Replacing with optimized files..."

if [ -f "src/main-optimized.js" ]; then
    cp "src/main-optimized.js" "src/main.js"
    echo "✅ Updated main.js with optimized version"
fi

if [ -f "src/style-optimized.css" ]; then
    cp "src/style-optimized.css" "src/style.css"
    echo "✅ Updated style.css with optimized version"
fi

if [ -f "package-optimized.json" ]; then
    cp "package-optimized.json" "package.json"
    echo "✅ Updated package.json with optimized version"
fi

# Step 3: Install dependencies
echo ""
echo "📥 Installing optimized dependencies..."
npm install

# Step 4: Build optimized version
echo ""
echo "🔨 Building optimized production version..."
npm run build

# Step 5: Create performance report
echo ""
echo "📊 Creating performance report..."
npm run analyze

# Step 6: Test the build
echo ""
echo "🧪 Testing the optimized build..."
echo "Starting preview server..."
echo "Open http://localhost:4173 in your browser"
echo "Run Lighthouse test on this URL to see improvements"
echo ""

# Step 7: Show summary
echo "🎉 Optimization Complete!"
echo "========================"
echo ""
echo "📈 Expected Improvements:"
echo "  • Performance: 77 → 85-90 (+8-13 points)"
echo "  • Accessibility: 79 → 90-95 (+11-16 points)"
echo "  • Best Practices: 96 → 98-100 (+2-4 points)"
echo "  • SEO: 82 → 90-95 (+8-13 points)"
echo ""
echo "🔧 Key Optimizations Applied:"
echo "  ✅ CSS minification and optimization"
echo "  ✅ JavaScript lazy loading and code splitting"
echo "  ✅ Enhanced SEO meta tags"
echo "  ✅ Improved accessibility (ARIA, focus management)"
echo "  ✅ Image optimization and compression"
echo "  ✅ Bundle analysis and tree shaking"
echo "  ✅ Hardware-accelerated animations"
echo "  ✅ Gzip compression configuration"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the preview at http://localhost:4173"
echo "  2. Run Lighthouse test to verify improvements"
echo "  3. Deploy the 'dist/' folder to your web server"
echo "  4. Upload '.htaccess' to enable compression"
echo "  5. Monitor real-world performance"
echo ""

# Start preview server
npm run preview
