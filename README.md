# Project

🔗 https://adibfara.github.io/stealjobs/

A React application with a feature-based architecture and centralized design system.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Query** for server state management
- **Tailwind CSS v4** for utility-first styling
- **shadcn/ui** for accessible UI components
- **ESLint** for code quality

## Project Structure

```
src/
├── components/          # shadcn/ui components
│   └── ui/              # Base UI components (button, etc.)
├── features/            # Feature-based modules
│   └── counter/         # Example: Counter feature
│       ├── components/  # Feature UI components
│       └── hooks/       # Feature logic hooks
├── shared/              # Shared design system & components
│   └── theme/           # Theme provider & toggle
├── lib/                 # Utility functions
└── index.css            # Global styles & design tokens
```

## Design System

The design system is centralized in `src/index.css` with CSS variables for:

- **Spacing**: `--spacing-xs` through `--spacing-3xl`
- **Sizes**: `--size-xs` through `--size-2xl`
- **Typography**: `--text-xs` through `--text-5xl`
- **Border radius**: `--radius-sm` through `--radius-4xl`
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- **Colors**: Full light/dark theme support via shadcn/ui

### Usage

```tsx
// Use design tokens in className
<div className="p-[var(--spacing-md)] text-[var(--text-lg)]">
  Content
</div>
```

## Architecture Principles

- **Feature-based folders**: Each feature has `hooks/` and `components/`
- **Hooks for logic**: All state and logic lives in hooks
- **Minimal styling in components**: Use design tokens, only margins/paddings inline
- **Theme from design system**: Colors, shadows come from centralized tokens

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```
