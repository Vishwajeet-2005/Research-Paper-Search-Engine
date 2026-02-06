# 📚 Research Paper Search Engine

![Research Paper Search Engine](https://img.shields.io/badge/Status-Fully%20Functional-brightgreen)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-blue)
![Mobile-Friendly](https://img.shields.io/badge/Mobile-Friendly-4285F4)
![API](https://img.shields.io/badge/API-CrossRef-007AFF)

A modern, fully functional web application for searching real academic research papers using the CrossRef API with a beautiful, mobile-first responsive design.

## ✨ Live Demo

🔗 **[Try it Live on Vercel](https://research-paper-search.vercel.app)**

## 🎯 Features

### 🔍 **Real-Time Search**
- **CrossRef API Integration** - Real academic papers from millions of publications
- **Full-text search** across titles, abstracts, and authors
- **No mock data** - All results are real academic papers
- **Polite API usage** with proper attribution

### 📱 **Mobile-First Design**
- **Fully responsive** - Works perfectly on all screen sizes
- **Touch-optimized** - Large buttons and easy navigation
- **Progressive enhancement** - Better experience on capable devices
- **Safe area support** - Properly handles iPhone notches and home indicators

### 🎛️ **Advanced Search Features**
- **Year range filtering** - Find papers from specific time periods
- **Sorting options** - Relevance, newest, oldest
- **Results customization** - Choose 10-50 results per page
- **Quick topics** - One-tap access to popular research areas

### 📊 **Paper Management**
- **Detailed paper view** - Complete metadata in a beautiful modal
- **Direct paper access** - Open original papers with one click
- **DOI copying** - Copy DOI to clipboard with visual feedback
- **Citation generator** - APA format citations for papers
- **Citation counts** - See how often papers are cited

### 💡 **Enhanced UX**
- **Loading states** - Clear feedback during searches
- **Error handling** - Helpful error messages with suggestions
- **Search history** - Local storage for recent searches
- **Pagination** - Smooth navigation through results
- **Keyboard shortcuts** - Enter key for quick searching

## 🏗️ Architecture

```
📁 Research-Paper-Search-Engine/
├── 📄 index.html          # Main HTML structure (updated for mobile)
├── 🎨 style.css           # Mobile-first responsive CSS
├── ⚡ script.js           # CrossRef API integration
└── 📄 README.md          # This documentation
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls)

### Local Development
1. **Clone the repository**
   ```bash
   git clone https://github.com/Vishwajeet-2005/Research-Paper-Search-Engine.git
   cd Research-Paper-Search-Engine
   ```

2. **Open the project**
   Simply open `index.html` in your browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js with http-server
   npx http-server .
   ```

3. **Start searching**
   - Open `http://localhost:8000` in your browser
   - Enter a research topic or keywords
   - Apply filters as needed
   - Click on papers for detailed view

## 🛠️ Technology Stack

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Media Queries
- **Vanilla JavaScript** - No frameworks, pure performance

### **API Integration**
- **CrossRef REST API** - Academic paper search
- **Fetch API** - Modern HTTP requests
- **Async/Await** - Clean asynchronous code

### **Mobile Features**
- **CSS Grid & Flexbox** - Responsive layouts
- **Media Queries** - Device-specific styling
- **Touch Events** - Mobile-optimized interactions
- **Viewport Meta Tag** - Proper mobile scaling

## 📱 Mobile Optimization

The application has been specifically optimized for mobile devices:

| Feature | Mobile Implementation |
|---------|----------------------|
| **Touch Targets** | Minimum 44px buttons |
| **Typography** | Responsive font scaling |
| **Layout** | Single column on small screens |
| **Navigation** | Easy thumb reach areas |
| **Forms** | Mobile-optimized inputs |
| **Modal** | Full-screen with easy close |

### **Breakpoints**
- **Mobile**: < 768px (single column, stacked)
- **Tablet**: 768px - 1023px (two column layout)
- **Desktop**: ≥ 1024px (full grid layout)

## 🔧 API Details

### **CrossRef API Integration**
```javascript
// API Configuration
{
    baseUrl: 'https://api.crossref.org/works',
    mailto: 'your-email@example.com', // Polite usage
    rows: 20, // Results per page
    timeout: 10000 // Request timeout
}
```

### **Search Parameters**
- `query`: Search terms
- `rows`: Results per page (10-50)
- `sort`: Publication date (newest/oldest)
- `filter`: Year range filtering
- `mailto`: Your email for polite usage

### **Rate Limits**
- Approximately 50 requests/second
- No daily limit for polite usage
- Always includes your email for tracking

## 🚀 Deployment

### **Deploy on Vercel (Recommended)**
1. Fork this repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Set project name (must be lowercase)
6. Click "Deploy"

### **Deploy on GitHub Pages**
1. Push to `gh-pages` branch:
   ```bash
   git subtree push --prefix . origin gh-pages
   ```
2. Enable GitHub Pages in repository settings
3. Access at: `https://yourusername.github.io/Research-Paper-Search-Engine`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CrossRef** for providing free API access to academic papers
- **Vercel** for hosting and deployment
- **Font Awesome** for icons
- **Google Fonts** for typography
- **Open source community** for inspiration

## 📞 Support

For support, feature requests, or bug reports:
1. 📧 **Email**: vishwajeetsurvase28@gmail.com
2. 🐛 **Issues**: [GitHub Issues](https://github.com/Vishwajeet-2005/Research-Paper-Search-Engine/issues)
3. 💬 **Discussion**: [GitHub Discussions](https://github.com/Vishwajeet-2005/Research-Paper-Search-Engine/discussions)

## 🌟 Show Your Support

If you find this project useful:
- ⭐ **Star** the repository
- 🍴 **Fork** it for your own use
- 🐛 **Report** bugs and issues
- 💡 **Suggest** new features

---

**Built with ❤️ by Vishwajeet** | [GitHub](https://github.com/Vishwajeet-2005) | [Live Demo](https://research-paper-search.vercel.app)

---

<div align="center">
  
### 🚀 Ready to Search Academic Papers?
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVishwajeet-2005%2FResearch-Paper-Search-Engine)
[![Try it Live](https://img.shields.io/badge/Try_it_Live-Online-brightgreen?style=for-the-badge&logo=vercel)](https://research-paper-search.vercel.app)

</div>
```
