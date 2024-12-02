# Session Handling in Next.js with shadcn UI and NextAuth.js

This guide outlines the differences between client-side and server-side session handling in our Next.js application using shadcn UI and NextAuth.js.

## Client-side Session Handling

**File:** `hooks/use-current-user.ts`

```typescript
import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const session = useSession();
  return session.data?.user;
}
```

- Uses the `useSession` hook from `next-auth/react`
- Non-async function
- Typically used in React components
- Accesses user data via `session.data?.user`

## Server-side Session Handling

**File:** `lib/auth.ts`

```typescript
import { auth } from "@/auth"

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
}
```

- Uses the `auth()` function (custom implementation)
- Async function
- Used in server-side operations (e.g., API routes, Server Components)
- Accesses user data via `session?.user`

## Key Differences

1. **Async vs Non-async:** Server-side is async, client-side is not
2. **Data Access:** Slight difference in how user data is accessed
3. **Context:** Client-side for components, server-side for backend operations

## Best Practices

- Use client-side method for reactive UI components
- Use server-side method for secure, server-only operations
- Ensure consistent user data structure between both methods

## Usage Examples

### Client-side (React Component)

```tsx
import { useCurrentUser } from "@/hooks/use-current-user";

const ProfileComponent = () => {
  const user = useCurrentUser();
  
  if (!user) return <div>Loading...</div>;
  
  return <div>Welcome, {user.name}!</div>;
};
```

### Server-side (API Route or Server Component)

```typescript
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await currentUser();
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Proceed with authorized actions
}
```

Remember: Always use the appropriate method based on the context (client or server) to ensure optimal performance and security.