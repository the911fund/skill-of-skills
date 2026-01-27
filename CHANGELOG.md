# Changelog

All notable changes to the Skill of Skills platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-27

### 🌟 Added
- **Dark Mode Support**: Complete theme toggle system with persistent user preference
- **Golden Ratio Branding**: Prominent display of quality validation system
- **Enhanced Navigation**: Icon-based navigation with improved mobile responsiveness
- **Theme Context**: React context for centralized theme management
- **Professional UI**: Modern gradient badges, status indicators, and micro-interactions
- **Sticky Header**: Improved navigation with backdrop blur effects
- **Custom Scrollbars**: Dark mode optimized scrolling experience

### 🎨 Improved
- **Typography**: Enhanced text hierarchy and readability across light/dark themes
- **Color System**: Comprehensive design token system with CSS custom properties
- **Layout**: Better responsive grid layouts for categories and tool cards
- **Animations**: Smooth transitions for theme switching and hover states
- **Footer**: Enhanced with proper attribution and additional links

### 🔧 Technical
- **TailwindCSS**: Updated configuration with dark mode support and custom animations
- **TypeScript**: Improved type safety for theme context and components
- **Performance**: Optimized component rendering with proper React patterns
- **Build System**: Updated dependencies and resolved deprecation warnings

### 📦 Components
- `ThemeToggle`: Accessible theme switcher with proper ARIA labels
- `ThemeContext`: Global theme state management with localStorage persistence
- Enhanced `Header`, `Footer`, `Navigation` components with dark mode support

### 🛡️ Security
- No security vulnerabilities introduced
- Maintained existing permission model and validation systems
- Improved user data handling with localStorage theme preferences

---

## [1.0.0] - 2026-01-26

### 🚀 Initial Release

#### Core Features
- **Tool Discovery Engine**: Automated GitHub repository scanning with N8N workflows
- **Golden Ratio Validation**: AI-powered quality assessment system for repositories
- **Risk Assessment**: Automated security risk evaluation and categorization
- **Web Directory**: Next.js-based web interface for browsing and searching tools
- **Database Integration**: PostgreSQL backend with Prisma ORM
- **API Endpoints**: RESTful API for programmatic access to tool data

#### Tool Types Supported
- 📄 Skills (SKILL.md-based)
- 🔌 Claude Plugins (.claude-plugin)
- 📦 Collections (multi-skill repositories) 
- ⌨️ CLI Tools (npm packages)
- 🔗 MCP Servers (mcp.json-based)
- 📚 Resources (documentation and references)

#### Validation System
- **Golden Ratio Algorithm**: Stars ≥100, 5-20% fork ratio, <90 days since update, 3+ contributors
- **Automated Risk Assessment**: Low/Medium/High/Critical classification based on permissions
- **Content Validation**: Automatic detection of skill types and requirements
- **Quality Scoring**: Community metrics and maintenance indicators

#### Infrastructure
- **Docker Deployment**: Containerized application stack
- **PM2 Process Management**: Reliable service orchestration
- **N8N Automation**: Workflow-based discovery and validation
- **PostgreSQL Database**: Scalable data persistence layer

#### Web Interface Features
- **Search & Browse**: Full-text search with category filtering
- **Trust Indicators**: Clear security and quality badges
- **Responsive Design**: Mobile-first interface design
- **Tool Submission**: Community contribution workflow
- **Analytics Dashboard**: Usage and discovery metrics

### 📊 Launch Metrics
- 7 tools indexed at launch
- Multiple categories supported
- Automated validation pipeline operational
- Community submission system ready