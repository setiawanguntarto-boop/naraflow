# Code Standards & Best Practices

## Import Strategy

### Absolute Imports ✅
Always use absolute imports with `@/` prefix instead of relative imports:

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { workflowPresets } from '@/lib/templates/workflowPresets';

// ❌ Incorrect
import { Button } from '../../../components/ui/button';
import { useWorkflowState } from '../../hooks/useWorkflowState';
```

### Import Order
Organize imports in this order:
1. External dependencies (React, third-party libraries)
2. Internal absolute imports (@/*)
3. Relative imports (only when absolutely necessary)
4. Type imports (using `type` keyword)

```typescript
// Example
import React, { useState, useEffect } from 'react';
import { Button } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useWorkflowState } from '@/hooks/useWorkflowState';

import type { Node, Edge } from '@xyflow/react';
```

## TypeScript Standards

### Separate Type Definitions
Place shared types in dedicated files to prevent circular dependencies:

```typescript
// src/types/workflow.ts
export interface WorkflowConfig {
  id: string;
  name: string;
  // ...
}

// In components
import type { WorkflowConfig } from '@/types/workflow';
```

### Use Interface for Object Shapes
```typescript
// ✅ Preferred
export interface WorkflowPreset {
  id: string;
  label: string;
  description: string;
}

// ❌ Avoid
export type WorkflowPreset = {
  id: string;
  label: string;
  description: string;
};
```

### Type vs Interface
- Use `interface` for object shapes that might be extended
- Use `type` for unions, intersections, and computed types

## ESLint Configuration

### Running Linter
```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Key Rules
- No `console.log` in production code (use `warn` or `error` instead)
- Unused variables are warnings (prefix with `_` to ignore)
- Prefer `const` over `let`

## Prettier Configuration

### Running Formatter
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Key Settings
- Single quotes: **false** (use double quotes)
- Semicolons: **true** (always include)
- Print width: 100 characters
- Tab width: 2 spaces

## File Organization

### Directory Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── canvas/         # Canvas-related components
│   └── workflow/       # Workflow-specific components
├── hooks/              # Custom React hooks
├── lib/                # Library functions and utilities
│   ├── executors/      # Node executors
│   ├── services/       # External services
│   └── templates/      # Workflow templates
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── core/               # Core business logic
```

### Naming Conventions
- **Files**: camelCase for utilities, PascalCase for components
  - `workflowPresets.ts` ✅
  - `WorkflowStudio.tsx` ✅
- **Components**: PascalCase
  - `MentionInput.tsx` ✅
- **Functions/Variables**: camelCase
  - `generateWorkflow()` ✅
- **Types/Interfaces**: PascalCase
  - `WorkflowPreset` ✅

## Component Best Practices

### Component Structure
```typescript
// 1. Imports
import React, { useState } from 'react';

// 2. Type definitions
interface ComponentProps {
  title: string;
}

// 3. Component function
export function Component({ title }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState('');

  // 5. Event handlers
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

### Memoization
Use React.memo for expensive components that re-render frequently:

```typescript
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Component code
});
```

## Git Workflow

### Commit Messages
Use clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "Fix Generate button not working when preset is selected"
git commit -m "Add WhatsApp templates for Broiler workflow"
git commit -m "Refactor: extract type definitions to prevent circular dependencies"

# ❌ Bad
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

### Pre-commit Checklist
Before committing, run:
```bash
npm run precommit
```

This checks:
- ✅ ESLint (code quality)
- ✅ Prettier (code formatting)
- ✅ TypeScript (type checking)

## Performance Considerations

### Lazy Loading
Use React.lazy for route-based code splitting:

```typescript
const WorkflowCanvas = lazy(() => import('@/components/canvas/WorkflowCanvas'));
```

### Bundle Size
- Avoid large dependencies when possible
- Use dynamic imports for heavy components
- Monitor bundle size with `npm run analyze`

## Testing

### File Naming
Test files should mirror source files:
- `WorkflowCanvas.tsx` → `WorkflowCanvas.test.tsx`

### Writing Tests
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';

describe('WorkflowCanvas', () => {
  it('renders correctly', () => {
    render(<WorkflowCanvas />);
    expect(screen.getByText('Workflow')).toBeInTheDocument();
  });
});
```

## Common Issues & Solutions

### Circular Dependencies
**Problem**: File A imports from File B, which imports from File A

**Solution**: Extract shared types to separate file

```typescript
// types/workflow.ts
export interface WorkflowPreset { /* ... */ }

// fileA.ts
import type { WorkflowPreset } from '@/types/workflow';

// fileB.ts
import type { WorkflowPreset } from '@/types/workflow';
```

### ESLint Disabled Rules
Avoid using `// eslint-disable` unless absolutely necessary. Instead, fix the issue or configure the rule.

### TypeScript `any`
Avoid `any` type. Use `unknown` or proper type definitions instead.

```typescript
// ❌ Bad
function process(data: any) { /* ... */ }

// ✅ Good
function process<T>(data: T): T { /* ... */ }
```

## Maintenance Commands

```bash
# Full check before commit
npm run precommit

# Quick checks individually
npm run lint              # Check code quality
npm run format:check      # Check formatting
npm run type-check        # Check TypeScript types

# Auto-fix what's possible
npm run lint:fix          # Fix linting issues
npm run format            # Format code
```

## IDE Configuration

### VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Recommended Extensions
- ESLint
- Prettier
- TypeScript Importer
- Path Intellisense

