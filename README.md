# SAT Question Bank - Static Edition

A modern, serverless web application for browsing and practicing SAT questions. Built as a static Single Page Application (SPA) that works on GitHub Pages without any backend infrastructure.

## 🎯 Overview

This is a **static version** of the SAT Question Bank that:
- Works entirely in the browser with **no server required**
- Can be deployed on **GitHub Pages**, Netlify, or any static hosting
- Features **advanced filtering**, search, and practice modes
- Stores progress and starred questions in **browser localStorage**
- Loads **2000+ SAT questions** from chunked JSON files for optimal performance

## ✨ Features

### Core Functionality
- **🔍 Advanced Search & Filtering**
  - Search by question content, context, or keywords
  - Filter by module (Math / Reading & Writing)
  - Filter by domain (Algebra, Geometry, Words in Context, etc.)
  - Filter by difficulty (Easy, Medium, Hard)

### Practice Features
- **⭐ Question Starring** - Save questions for review
- **🎲 Random Practice** - Randomized question sets
- **📊 Progress Tracking** - Browser-based history and statistics
- **⌨️ Keyboard Shortcuts** - Fast navigation and actions

### User Experience
- **🎨 Modern Dark Theme** - Sleek design for high school students
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🚀 Fast Performance** - Lazy loading with chunked data files
- **💾 Offline Ready** - Questions cached after first load

## 🏗️ Architecture

### Static SPA Design
```
SAT Question Bank (Static)
├── Frontend-Only Application
├── No Server/Database Required
├── GitHub Pages Compatible
└── Browser-Based Storage
```

### File Structure
```
sat-question-bank-static-starter/
├── index.html                 # Main application page
├── app.js                     # Core application logic
├── styles.css                 # Modern dark theme
├── worker.js                  # Web Worker (future search enhancement)
├── prepare_data.py            # Data processing script
├── cb-digital-questions.json  # Original question database (25MB)
└── data/
    ├── manifest.json          # Chunk metadata and versioning
    ├── lookup.json            # Quick filtering data
    ├── sample.json            # Sample data for testing
    └── chunks/
        ├── part-000.json      # Question chunks (1000 questions each)
        ├── part-001.json
        └── part-002.json
```

## 🚀 Quick Start

### Option 1: Direct Usage (Recommended)
1. **Open `index.html`** in your web browser
2. **Browse questions** using the filters and search
3. **Star questions** for later review
4. **Use keyboard shortcuts** for faster navigation

### Option 2: Local Development Server
```bash
# Serve locally (recommended for development)
python -m http.server 8080
# OR
npx serve .

# Open: http://localhost:8080
```

### Option 3: Deploy to GitHub Pages
1. **Create a new repository** on GitHub
2. **Upload all files** to the repository
3. **Enable GitHub Pages** in repository settings
4. **Access your live site** at `https://username.github.io/repository-name`

## 📊 Data Management

### Question Data Structure
Each question contains:
```json
{
  "uId": "q-0001",
  "questionId": "MATH-001", 
  "module": "math",
  "primary_class_cd_desc": "Algebra",
  "skill_desc": "Linear equations in two variables",
  "difficulty": "M",
  "stem_html": "<p>Question content...</p>",
  "choices": ["Option A", "Option B", "Option C", "Option D"],
  "correct_choice_index": 2,
  "explanation_html": "<p>Detailed explanation...</p>"
}
```

### Data Processing
The `prepare_data.py` script converts the large question database into optimized chunks:

```bash
# Convert large JSON file into chunks
python prepare_data.py --input cb-digital-questions.json --out ./data --chunk 1000

# This creates:
# - data/manifest.json (chunk metadata)
# - data/chunks/part-*.json (question chunks)
# - data/lookup.json (filtering data)
```

**Benefits of Chunking:**
- **Faster Initial Load** - Only loads manifest first
- **Lazy Loading** - Questions loaded as needed
- **Better Performance** - Smaller memory footprint
- **GitHub Pages Compatible** - Works within size limits

## 🎮 User Interface

### Modern Design Features
- **Dark Theme** - Optimized for extended study sessions
- **Clean Typography** - Easy-to-read questions and explanations
- **Color-Coded Badges** - Visual difficulty and module indicators
- **Smooth Interactions** - Hover effects and transitions
- **Toast Notifications** - User feedback for actions

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `R` | Random practice mode |
| `S` | Show starred questions |

### Filter System
- **Module Filter** - Math or Reading & Writing
- **Domain Filter** - Subject area (Algebra, Geometry, etc.)
- **Difficulty Filter** - Easy, Medium, or Hard questions
- **Text Search** - Searches question content and skill descriptions

## 💾 Data Persistence

### localStorage Features
The app uses browser localStorage to save:
- **Starred Questions** - Persisted across sessions
- **Practice History** - Last 200 questions viewed
- **Filter Preferences** - Remembers last used filters

### Privacy & Storage
- **No External Tracking** - All data stays in your browser
- **No Account Required** - Works immediately without signup
- **Offline Capability** - Questions cached after first load

## 🛠 Technical Details

### Performance Optimizations
- **Chunked Data Loading** - Progressive loading of question sets
- **Client-Side Filtering** - Instant filter responses
- **Memory Management** - Efficient question storage and retrieval
- **Lazy Rendering** - Only renders visible questions

### Browser Compatibility
- **Modern Browsers** - Chrome, Firefox, Safari, Edge (ES6+ required)
- **Mobile Responsive** - iOS Safari, Chrome Mobile
- **Progressive Enhancement** - Core functionality works without JavaScript

### Web Standards Used
- **ES6+ JavaScript** - Modern syntax and features
- **CSS Grid & Flexbox** - Responsive layouts
- **Web Workers** - Prepared for advanced search (future enhancement)
- **localStorage API** - Client-side data persistence

## 🚀 Deployment Options

### GitHub Pages (Recommended)
1. **Create repository** with all project files
2. **Enable Pages** in repository settings
3. **Choose source** - Deploy from main branch
4. **Access live site** - Usually available within minutes

### Other Static Hosts
- **Netlify** - Drag & drop deployment
- **Vercel** - Git integration
- **Surge.sh** - Command-line deployment
- **Firebase Hosting** - Google's static hosting

### Performance Considerations
- **Large File Sizes** - Main JSON is 25MB (consider chunking)
- **Loading Strategy** - Implement progressive loading
- **Caching Headers** - Set appropriate cache policies
- **CDN Distribution** - Consider using a CDN for global access

## 🧪 Development

### Testing Locally
```bash
# Test with sample data
python -m http.server 8000
open http://localhost:8000

# Verify all features:
# - Question loading and display
# - Filtering and search
# - Starring functionality  
# - Keyboard shortcuts
# - Mobile responsiveness
```

### Data Updates
To update questions:
1. **Replace** `cb-digital-questions.json` with new data
2. **Run** `python prepare_data.py` to regenerate chunks
3. **Test** locally before deploying
4. **Deploy** updated files to your hosting platform

### Customization Options
- **Theme Colors** - Modify CSS variables in `styles.css`
- **Question Display** - Update rendering logic in `app.js`
- **Filtering Logic** - Enhance filter functions
- **Additional Features** - Add new practice modes or statistics

## 📈 Analytics & Insights

### Built-in Tracking (Privacy-Friendly)
- **Question Views** - Stored locally only
- **Star Patterns** - No external tracking
- **Practice Sessions** - Browser-based history

### External Analytics (Optional)
To add analytics while respecting privacy:
- **Google Analytics 4** - With consent management
- **Simple Analytics** - Privacy-focused alternative
- **Custom Tracking** - Aggregate usage patterns only

## 🔧 Troubleshooting

### Common Issues

**Questions not loading**
- Check browser console for errors
- Verify `data/manifest.json` exists and is valid
- Ensure chunk files are accessible
- Try clearing browser cache

**Filters not working**
- Verify JavaScript is enabled
- Check for case sensitivity in search terms
- Reset filters and try again
- Inspect network tab for loading issues

**Performance issues**
- Reduce visible questions per page
- Clear browser localStorage
- Update to newer browser version
- Check available system memory

**Mobile display problems**
- Verify responsive CSS is loading
- Test in device emulation mode
- Check viewport meta tag
- Validate touch interactions

### Browser Storage Limits
- **localStorage** - Typically 5-10MB per origin
- **Question Data** - Chunks loaded as needed
- **User Data** - Starred questions and history
- **Cache Management** - Automatic cleanup of old data

## 🤝 Contributing

### Areas for Enhancement
- **Advanced Search** - Implement full-text search with lunr.js
- **Statistics Dashboard** - Practice analytics and progress charts
- **Export Features** - Download starred questions or results
- **Accessibility** - Enhanced screen reader support
- **PWA Features** - Service worker for offline functionality

### Code Style
- **ES6+ Syntax** - Use modern JavaScript features
- **Modular Design** - Separate concerns clearly
- **Documentation** - Comment complex logic
- **Testing** - Add unit tests for critical functions

## 📄 License

This project is intended for educational purposes. Ensure compliance with SAT content usage policies and respect intellectual property rights.

## 🎓 Educational Impact

### For Students
- **Self-Paced Learning** - Study at your own speed
- **Targeted Practice** - Focus on specific skill areas
- **Progress Tracking** - Monitor improvement over time
- **Accessible Design** - Works on any device

### For Educators
- **Classroom Ready** - No setup or accounts required
- **Flexible Deployment** - Host anywhere, use offline
- **Student Privacy** - No data collection or tracking
- **Customizable Content** - Easy to modify for specific needs

---

**🌟 Ready to get started?** Open `index.html` in your browser or deploy to GitHub Pages for instant access to thousands of SAT practice questions!