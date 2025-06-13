# 3D Modeling App for Kids - Technical Specifications

## Overview
A static website-based 3D modeling application designed for children, featuring simple cube-based building mechanics with professional visual quality and export capabilities for 3D printing.

## Technology Stack

### Core 3D Library: **Babylon.js**
**Rationale**: Babylon.js is chosen over Three.js for the following reasons:
- **Native TypeScript support**: Built from the ground up in TypeScript, providing excellent type safety and developer experience
- **Built-in features**: Includes physics, animation, GUI, and asset loading out of the box
- **Professional quality**: Designed for game development with high-quality rendering capabilities
- **Touch controls**: Excellent built-in support for touch, mouse, and trackpad interactions
- **Export capabilities**: Better support for geometry manipulation and export functionality
- **Modular architecture**: Can import only needed features to keep bundle size manageable

### Additional Technologies
- **TypeScript**: Primary development language for type safety and maintainability
- **Vite**: Modern build tool for fast development and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework for rapid, consistent styling
- **shadcn/ui**: Premium component library built on Radix UI + Tailwind for professional appearance
- **Lucide React**: High-quality icon library for consistent iconography
- **HTML5**: Modern semantic markup

### UI Library Decision: **shadcn/ui**
**Rationale**: shadcn/ui is chosen for professional appearance:
- **Built on proven foundations**: Uses Radix UI (accessibility) + Tailwind CSS (styling)
- **Copy-paste approach**: Full ownership and customization of components in our codebase
- **Professional aesthetics**: Pre-styled components with modern design system
- **Accessibility-first**: Inherits Radix UI's excellent accessibility features
- **Performance**: Lightweight, only includes components you actually use
- **TypeScript native**: Excellent type safety and developer experience
- **Adult appeal**: Professional appearance that attracts adult users while remaining kid-friendly

## Feature Requirements

### 3D Interaction Controls
- **Mouse controls**: Left-click drag for rotation, scroll wheel for zoom, right-click drag for panning
- **Trackpad controls**: Two-finger scroll for zoom, two-finger drag for pan, single-finger drag for rotation
- **Touch controls (iPad)**: Pinch-to-zoom, two-finger pan, single-finger rotation
- **Keyboard shortcuts**: WASD for movement, Space/Shift for up/down

### Visual Design
- **Theme**: Dark theme with professional appearance
- **Lighting**: Basic three-point lighting setup (key, fill, rim)
- **Grid**: Optional 3D grid overlay for precise placement
- **Anti-aliasing**: Enabled for smooth edges
- **Shadows**: Soft shadows for depth perception

### Building Mechanics
- **Primitives**: Unit cubes only (1x1x1 units)
- **Placement rules**: Cubes can only be placed adjacent to existing cubes (face-adjacent, not edge or corner)
- **Removal**: Click to remove individual cubes
- **Colors**: 16 predefined colors in a palette
- **No physics**: Cubes remain floating in place when adjacent cubes are removed

### Color Palette (16 Colors)
```
Primary Colors:
- Red (#FF0000)
- Green (#00FF00)
- Blue (#0000FF)
- Yellow (#FFFF00)
- Cyan (#00FFFF)
- Magenta (#FF00FF)

Secondary Colors:
- Orange (#FF8000)
- Purple (#8000FF)
- Lime (#80FF00)
- Teal (#00FF80)
- Pink (#FF0080)
- Sky Blue (#0080FF)

Neutral Colors:
- White (#FFFFFF)
- Light Gray (#C0C0C0)
- Dark Gray (#808080)
- Black (#000000)
```

### User Interface
- **Professional minimal design**: Clean, uncluttered interface with premium aesthetics
- **Floating toolbar**: Elegant floating panel with rounded corners and subtle shadows
- **Color picker**: Modern color palette with hover effects and selection indicators
- **Tool buttons**: Toggle buttons with smooth animations and visual feedback
- **Export button**: Prominent CTA button with loading states and success feedback
- **Clear button**: Destructive action with confirmation dialog
- **Responsive**: Seamless experience across desktop, tablet, and mobile devices
- **Micro-interactions**: Subtle animations and transitions for professional feel
- **Glass morphism**: Modern UI effects with backdrop blur and transparency

### Export Functionality
- **Format**: STL (STereoLithography) for 3D printing compatibility
- **Units**: Millimeters (each cube = 10mm x 10mm x 10mm)
- **Quality**: High-resolution mesh suitable for slicing software
- **Filename**: Auto-generated with timestamp (e.g., "cube-model-2024-06-13.stl")

## Technical Implementation Plan

### Phase 1: Project Setup & Core 3D Engine
1. Initialize Vite + TypeScript project with Tailwind CSS
2. Set up shadcn/ui component library and design system
3. Set up Babylon.js with basic scene, camera, and lighting
4. Implement camera controls (ArcRotateCamera)
5. Create professional dark theme with glass morphism effects
6. Add basic cube geometry and materials

### Phase 2: Building Mechanics
1. Implement cube placement system with adjacency detection
2. Add cube removal functionality toggle button
3. Create material system for 16 colors
4. Implement placement validation (adjacent-only rules)
5. Add visual feedback for valid/invalid placement

### Phase 3: User Interface
1. Create professional floating UI layout with shadcn/ui components
2. Implement elegant color picker with hover effects and animations
3. Add tool mode switching with toggle buttons and visual feedback
4. Create responsive design optimized for mobile/tablet interactions
5. Add keyboard shortcuts with visual indicators
6. Implement micro-interactions and smooth transitions

### Phase 4: Export & Polish
1. Implement STL export functionality
2. Add proper error handling and user feedback
3. Optimize performance for large models
4. Add loading states and animations
5. Cross-platform testing (desktop, iPad, mobile)

## File Structure
```
src/
├── main.ts                    # Application entry point
├── App.tsx                    # Main React component
├── engine/
│   ├── BabylonEngine.ts       # 3D engine wrapper
│   ├── CubeManager.ts         # Cube placement/removal logic
│   └── ExportManager.ts       # STL export functionality
├── components/
│   ├── ui/                    # shadcn/ui components (copied locally)
│   │   ├── button.tsx         # Button component
│   │   ├── dialog.tsx         # Modal dialogs
│   │   ├── toggle.tsx         # Toggle buttons
│   │   └── tooltip.tsx        # Tooltips
│   ├── ColorPicker.tsx        # Professional color selection
│   ├── FloatingToolbar.tsx    # Main UI toolbar
│   ├── ExportDialog.tsx       # Export confirmation dialog
│   └── Canvas3D.tsx           # Babylon.js canvas wrapper
├── hooks/
│   ├── use3DEngine.ts         # Custom hook for 3D engine
│   └── useKeyboardShortcuts.ts # Keyboard handling
├── utils/
│   ├── constants.ts           # Colors, dimensions, settings
│   ├── cn.ts                  # Tailwind class name utility
│   └── helpers.ts             # Utility functions
├── styles/
│   └── globals.css            # Tailwind base styles + custom CSS
└── lib/
    └── utils.ts               # shadcn/ui utilities
```

## Performance Considerations
- **Instancing**: Use Babylon.js instancing for efficient rendering of multiple cubes
- **Frustum culling**: Automatic culling of off-screen cubes
- **LOD**: Level-of-detail for distant cubes if needed
- **Memory management**: Proper disposal of removed cube instances
- **Touch optimization**: Responsive touch events with proper debouncing

## Browser Compatibility
- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **WebGL 2.0**: Required for Babylon.js features
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Graceful degradation**: Fallback messaging for unsupported browsers

## Accessibility
- **Keyboard navigation**: Full keyboard support for all functions
- **High contrast**: Dark theme with sufficient contrast ratios
- **Screen reader**: Proper ARIA labels for UI elements
- **Focus indicators**: Clear visual focus states
- **Touch targets**: Minimum 44px touch targets for mobile

## Future Enhancements (Out of Scope)
- Multiple primitive shapes (spheres, cylinders)
- Texture mapping
- Animation system
- Collaborative editing
- Cloud save/load
- Advanced lighting effects
- VR/AR support