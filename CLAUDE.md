# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start dev server**: `npm run dev` - Starts HTTP server on port 3000 with live reload
- **Start production server**: `npm start` - Starts HTTP server on port 3000 
- **Run tests**: `npm test` - Currently returns success (no tests implemented)

## Architecture Overview

This is a **client-side only** web application for salary analysis and team management. All processing occurs in the browser with no backend dependencies.

### Core Application Structure

- **Main entry point**: `src/main.js` - Initializes all components and manages application state
- **App state management**: Global `AppState` object stores employee data, components, and configuration
- **Component loading**: Dynamic script loading with dependency management via `loadScriptsSequentially()`
- **Tab-based navigation**: Main tabs (Table, Raises, Analytics, Visualizations, Export) with sub-tabs for complex sections

### Key Components Architecture

**Data Processing Pipeline**:
1. `FileUpload` → `CSVParser` → `DataValidator` → `PerformanceSuggester` → `DataIntegrityChecker`
2. Employee data flows through validation, duplicate detection, and performance rating suggestions
3. All components update reactively when data changes

**Virtual Scrolling**: `DataTable` uses `VirtualScroll` for handling 10,000+ employee datasets efficiently

**Multi-Currency Support**: `CurrencyUtils` normalizes salaries to USD for comparison across countries

**Raise Planning**: Modular components (`ScenarioModeler`, `BudgetModeler`, `RaiseRecommendations`, `ApprovalWorkflow`) for salary planning workflows

### Error Handling

- Enhanced error system via `ErrorHandler` class with user-friendly messages
- Graceful degradation - components continue working if non-critical features fail
- Comprehensive logging for debugging performance suggester and data table initialization

### Performance Considerations

- Virtual scrolling for large datasets (10,000+ employees)
- Lazy component loading 
- Browser compatibility detection via `BrowserCompatibility` class
- Memory management with cleanup and optimization

### Data Security

- **No server communication** - all processing is local
- CSV data never leaves the browser
- No external dependencies for core functionality

## Important Implementation Notes

### Component Initialization Order
Components must be initialized in dependency order. Main.js handles this via `loadScriptsSequentially()`. Critical dependencies:
- `VirtualScroll` before `DataTable`
- `PerformanceSuggester` utils before `PerformanceSuggesterComponent`
- `CurrencyUtils` before currency analysis

### Data Flow Patterns
- Employee data stored in `AppState.employeeData`
- Components update via explicit calls when data changes
- Search and filtering coordinated between `SearchBar`, `FilterPanel`, and `DataTable`

### Error-Prone Areas
- **PerformanceSuggester loading**: Complex async loading with extensive error handling and logging
- **Data table initialization**: May timeout on large datasets, has 30-second timeout protection
- **CSV parsing**: Handles malformed data gracefully with detailed error reporting

### File Structure Patterns
- `src/components/` - Reusable UI components (PascalCase.js)
- `src/utils/` - Business logic and utilities (camelCase.js) 
- `src/styles/` - Component-specific CSS files
- All components are ES6 classes with initialization methods

## Browser Compatibility

Supports Chrome 80+, Safari 13+, Firefox 75+, Edge 80+ with graceful degradation for older browsers. Feature detection via `BrowserCompatibility` class determines available functionality.