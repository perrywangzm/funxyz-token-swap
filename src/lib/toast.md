# Toast System Documentation

This project uses the [Sonner](https://sonner.emilkowal.ski/) toast library with a custom wrapper for consistent error handling and user feedback.

## Setup

The toast system is already set up in the root layout (`src/app/layout.tsx`) with the `<Toaster />` component.

## Usage

Import the toast utility:

```typescript
import { showToast } from "@/lib/toast";
```

## Available Methods

### Basic Toast Types

```typescript
// Error toast (red, 5 second duration)
showToast.error("Something went wrong");

// Success toast (green, 3 second duration)
showToast.success("Operation completed successfully!");

// Info toast (blue, 4 second duration)
showToast.info("Here's some information");

// Warning toast (yellow, 4 second duration)
showToast.warning("Please be careful");
```

### Custom Duration

```typescript
showToast.error("Error message", { duration: 10000 }); // 10 seconds
showToast.success("Success message", { duration: 2000 }); // 2 seconds
```

### Loading Toast

```typescript
// Show loading toast
const loadingToast = showToast.loading("Processing...");

// Dismiss the loading toast
showToast.dismiss(loadingToast);

// Or dismiss by ID
showToast.dismiss("toast-id");
```

### API Error Handling

The `apiError` method is specifically designed for handling API errors:

```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  showToast.apiError(error, "Failed to fetch data");
}
```

This method:

- Extracts the error message if it's an Error object
- Falls back to a default message if not
- Shows the error for 5 seconds
- Automatically handles different error types

## Examples

### In Components

```typescript
"use client";

import { showToast } from "@/lib/toast";

export function MyComponent() {
  const handleSubmit = async () => {
    try {
      await submitData();
      showToast.success("Data submitted successfully!");
    } catch (error) {
      showToast.apiError(error, "Failed to submit data");
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### In Store Actions

```typescript
// Already implemented in tokenStore.ts
const fetchTokenList = async (query?: string) => {
  try {
    const result = await api.getTokens(query);
    return result.tokens;
  } catch (error) {
    showToast.apiError(error, "Failed to fetch token list");
    throw error; // Re-throw for component handling
  }
};
```

### Loading States

```typescript
const handleAsyncOperation = async () => {
  const loadingToast = showToast.loading("Processing your request...");

  try {
    await someAsyncOperation();
    showToast.dismiss(loadingToast);
    showToast.success("Operation completed!");
  } catch (error) {
    showToast.dismiss(loadingToast);
    showToast.apiError(error, "Operation failed");
  }
};
```

## Styling

The toast system uses CSS variables for theming and automatically adapts to light/dark mode. The styling is defined in the `Toaster` component in `src/components/ui/sonner.tsx`.

## Best Practices

1. **Use `apiError` for API failures** - It handles error extraction automatically
2. **Show loading states** - Use loading toasts for async operations
3. **Keep messages concise** - Toast messages should be brief and clear
4. **Don't overuse** - Only show toasts for important user feedback
5. **Consistent messaging** - Use similar language patterns across the app
