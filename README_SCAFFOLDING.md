# render-neural | Scaffolding System

![render-neural](https://img.shields.io/badge/render--neural-v2.1.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)

## 🚀 Quick Launch

The application includes a built-in scaffolding system that provides multiple ways to launch and develop the neural rendering platform.

### Browser Interface

Open `index.html` in your browser to access the scaffolding interface with:

- **🚀 Development Server** - Launch Vite dev server
- **🔨 Build Application** - Create production build  
- **⚛️ Launch React App** - Direct React mount bypass

### Command Line Interface

```bash
# Using the launcher script
npm run launch:dev      # Start development server
npm run launch:build    # Build for production
npm run launch:install  # Install dependencies

# Or directly
node launch.js dev      # Start development server
node launch.js build    # Build for production
node launch.js help     # Show all commands
```

### Direct Commands

```bash
npm run dev       # Start Vite development server
npm run build     # Build for production
npm run preview   # Preview production build
npm install       # Install dependencies
```

## 🏗️ Application Architecture

### Core Systems

- **Asset Management** - File ingestion, search, GitHub sync
- **Sensor Control** - Depth cameras, LiDAR, thermal, multispectral
- **Operations Console** - Depth processing, normals, point clouds, Gaussian splats
- **Stability AI Integration** - Image/video generation, neural rendering
- **Autonomous Deployment** - Sector management, AI agents, calibration

### Technical Stack

**Frontend**
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling

**UI Components**
- Radix UI primitives
- shadcn/ui components
- Lucide icons

**3D Rendering**
- Three.js for 3D graphics
- WebGL for hardware acceleration
- Canvas API for 2D rendering

**AI Integration**
- Stability AI for content generation
- Neural networks for processing
- Computer vision algorithms

## 🎯 Scaffolding Features

### Interactive Launch Interface

The scaffolding system provides an interactive web interface that allows you to:

1. **View System Status** - See all components and their health
2. **Launch Development Tools** - Start dev server, build, or deploy
3. **Monitor Terminal Output** - Real-time feedback and logging
4. **Access Documentation** - Built-in help and guides

### Keyboard Shortcuts

When in scaffolding mode, use these shortcuts:

- `Ctrl/Cmd + D` - Launch development server
- `Ctrl/Cmd + B` - Build application
- `Ctrl/Cmd + R` - Launch React app directly
- `Ctrl/Cmd + C` - Clear terminal output

### Auto-Launch URLs

You can bypass the scaffolding interface with URL parameters:

```
http://localhost/index.html?launch=react  # Direct React launch
http://localhost/index.html?launch=dev    # Auto-start dev mode
```

## 📊 Development Status

✅ **Components Fixed** - All TypeScript errors resolved  
✅ **Build Ready** - Vite + React + TypeScript configured  
✅ **Launch Ready** - Development server available  
✅ **Scaffolding Active** - Interactive launch interface  

## 🛠️ Development Workflow

### First Time Setup

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd lolo-ren
   npm install
   ```

2. **Launch Scaffolding**
   ```bash
   # Open index.html in browser OR
   npm run dev
   ```

3. **Start Development**
   - Use scaffolding interface to launch dev server
   - Or run `npm run dev` directly
   - Navigate to `http://localhost:5173`

### Build and Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your hosting service
```

## 🔧 Configuration

### Vite Configuration

Located in `vite.config.ts`:
- TypeScript support
- React plugin
- Path aliases
- Development server settings

### Tailwind Configuration

Located in `tailwind.config.js`:
- Custom color schemes
- Component variants
- Responsive breakpoints

### TypeScript Configuration

Located in `tsconfig.json`:
- Strict type checking
- Modern ES features
- Path mapping

## 📱 Browser Compatibility

- **Chrome/Edge** 90+ (recommended)
- **Firefox** 88+
- **Safari** 14+
- **Mobile** Safari iOS 14+, Chrome Android 90+

## 🚨 Troubleshooting

### Common Issues

**Port 5173 already in use**
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

**TypeScript errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Scaffolding not showing**
- Check console for JavaScript errors
- Ensure index.html is served via HTTP (not file://)
- Try hard refresh (Ctrl+F5)

### Development Tools

The scaffolding system includes debugging tools:
- Real-time terminal output
- Component health monitoring  
- Build status indicators
- Error reporting

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**render-neural** - Spatial Intelligence & Neural Field Processing Platform
