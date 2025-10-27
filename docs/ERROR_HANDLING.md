# Error Handling & Resilience Guide

## Overview

Naraflow implements comprehensive error handling at multiple levels to ensure a resilient user experience. This includes:
- **Error Boundaries** for React component errors
- **Try-catch blocks** for async operations
- **Graceful degradation** for network failures
- **User-friendly error messages**

## Error Boundary

### Implementation

The `ErrorBoundary` component catches JavaScript errors in the React component tree and displays a fallback UI.

**Location**: `src/components/ErrorBoundary.tsx`

### Features

1. **Catches all React errors** in children components
2. **Displays user-friendly error UI** instead of white screen
3. **Shows error details in development mode**
4. **Provides recovery actions**:
   - Try Again (reset component state)
   - Reload Page
   - Go Home

5. **Logs errors** for debugging:
   - Console in development mode
   - Error tracking service in production (Sentry-ready)

### Usage

#### Basic Usage

```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### With Error Tracking

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to error tracking service
    if (import.meta.env.PROD) {
      Sentry.captureException(error, { extra: errorInfo });
    }
  }}
>
  <YourComponent />
</ErrorBoundary>
```

#### Custom Fallback UI

```typescript
<ErrorBoundary
  fallback={
    <div className="p-8 text-center">
      <h2>Oops! Something went wrong</h2>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

#### HOC Pattern

```typescript
import { withErrorBoundary } from "@/components/ErrorBoundary";

const MyComponent = () => {
  // Component code
};

export default withErrorBoundary(MyComponent);
```

### Integration Points

#### App Level (Routes)

Located in `src/App.tsx`:

```typescript
<ErrorBoundary onError={handleError}>
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* All routes */}
    </Routes>
  </Suspense>
</ErrorBoundary>
```

This catches:
- Lazy loading failures
- Component rendering errors
- Unhandled exceptions in pages

## Error Handling Best Practices

### 1. Async Operations

Always wrap async operations in try-catch:

```typescript
// ✅ Good
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error("Failed to fetch data:", error);
  toast.error("Failed to load data. Please try again.");
}

// ❌ Bad
const data = await fetchData();
setData(data);
```

### 2. Component-Level Error Handling

For components that may fail, use error boundary:

```typescript
export function WorkflowCanvas() {
  // Component code that may throw
  
  return (
    <ErrorBoundary>
      <Canvas />
    </ErrorBoundary>
  );
}
```

### 3. Network Error Handling

Handle network failures gracefully:

```typescript
async function saveWorkflow() {
  try {
    await api.save(data);
    toast.success("Saved successfully");
  } catch (error) {
    if (error instanceof NetworkError) {
      toast.error("Network error. Please check your connection.");
    } else if (error instanceof ValidationError) {
      toast.error("Invalid data. Please check your inputs.");
    } else {
      toast.error("Failed to save. Please try again.");
    }
  }
}
```

### 4. Graceful Degradation

Provide fallbacks for optional features:

```typescript
function WorkflowAssistant() {
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  
  useEffect(() => {
    // Check if AI service is available
    detectLocalLlama()
      .then(available => setIsAIEnabled(available))
      .catch(() => setIsAIEnabled(false));
  }, []);
  
  if (!isAIEnabled) {
    // Show basic assistant without AI features
    return <BasicAssistant />;
  }
  
  return <AIAssistant />;
}
```

### 5. User-Friendly Error Messages

Never expose technical errors to users:

```typescript
// ✅ Good
toast.error("Failed to generate workflow. Please try again.");

// ❌ Bad
toast.error(`Error: ${error.message}`);
```

## Error Types

### React Component Errors

**Cause**: Errors during component rendering
**Handled by**: ErrorBoundary
**Example**: Null reference, undefined property access

### Network Errors

**Cause**: API failures, timeouts
**Handled by**: Try-catch in async functions
**Example**: Fetch failed, network disconnected

### Validation Errors

**Cause**: Invalid user input
**Handled by**: Form validation, try-catch
**Example**: Invalid email format, required field missing

### Third-Party Errors

**Cause**: External library failures
**Handled by**: Error boundaries, try-catch
**Example**: React Flow errors, library bugs

## Error Logging

### Development Mode

Errors are logged to console with stack traces:

```typescript
console.error("Error caught by boundary:", error);
console.error("Error info:", errorInfo);
```

### Production Mode

Ready for integration with error tracking services:

```typescript
if (import.meta.env.PROD) {
  // Integrate with Sentry, LogRocket, etc.
  Sentry.captureException(error, { extra: errorInfo });
}
```

### Custom Error Logging

Add to ErrorBoundary's `onError` prop:

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom logging
    logErrorToService(error, {
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      userId: getCurrentUserId(),
    });
  }}
>
  <App />
</ErrorBoundary>
```

## Testing Error Handling

### Simulate Errors

```typescript
// Test component that throws
function TestErrorComponent() {
  throw new Error("Test error");
}

// Wrap with error boundary
<ErrorBoundary>
  <TestErrorComponent />
</ErrorBoundary>
```

### Error Recovery Testing

1. Trigger an error (e.g., network failure)
2. Verify error UI appears
3. Test "Try Again" button
4. Test "Reload Page" button
5. Test "Go Home" button

## Common Patterns

### Protected Route with Error Boundary

```typescript
<ErrorBoundary
  fallback={
    <ErrorPage 
      message="Failed to load page"
      onRetry={() => window.location.reload()}
    />
  }
>
  <Suspense fallback={<PageLoader />}>
    <ProtectedRoute>
      <YourPage />
    </ProtectedRoute>
  </Suspense>
</ErrorBoundary>
```

### Form with Error Handling

```typescript
function WorkflowForm() {
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (data: FormData) => {
    try {
      setError(null);
      await submitWorkflow(data);
      toast.success("Workflow saved!");
    } catch (err) {
      setError("Failed to save workflow. Please try again.");
      console.error(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="text-destructive">{error}</div>
      )}
      {/* Form fields */}
    </form>
  );
}
```

## Troubleshooting

### Error Boundary Not Catching Errors

**Problem**: Errors occur outside React component tree

**Solution**: Wrap error-prone code in try-catch or use error boundary at higher level

### Error Logging Not Working

**Problem**: Errors not appearing in error tracking service

**Solution**: Check if environment is PROD and error service is properly configured

### Infinite Error Loop

**Problem**: Error boundary keeps throwing errors

**Solution**: Check that fallback UI doesn't throw errors

## Best Practices Summary

1. ✅ Always wrap async operations in try-catch
2. ✅ Use ErrorBoundary for route-level error handling
3. ✅ Provide user-friendly error messages
4. ✅ Log errors for debugging in production
5. ✅ Implement retry logic for transient failures
6. ✅ Gracefully degrade features when dependencies fail
7. ✅ Never expose technical errors to end users
8. ✅ Test error scenarios during development

## Further Reading

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling in Production](https://sentry.io/for/react/)
- [Async Error Handling](https://javascript.info/async-await)

