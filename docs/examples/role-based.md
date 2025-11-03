---
title: Role-Based Access
description: Implement role-based access control (RBAC) in your Vue application using Keycloak roles and permissions
outline: deep
---

# Role-Based Access

Implement role-based access control (RBAC) in your Vue application using Keycloak roles.

## Basic Role Checking

Check if a user has specific roles:

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const { hasRealmRole, hasResourceRole } = useKeycloak();
</script>

<template>
  <div>
    <section v-if="hasRealmRole('user')">
      <h2>User Content</h2>
      <p>This is visible to users with the 'user' realm role.</p>
    </section>

    <section v-if="hasRealmRole('admin')">
      <h2>Admin Content</h2>
      <p>This is visible to administrators only.</p>
    </section>

    <section v-if="hasResourceRole('view', 'reports')">
      <h2>Reports</h2>
      <p>This user can view reports.</p>
    </section>
  </div>
</template>
```

## Role-Based Components

Create wrapper components for role-based rendering:

```vue
<!-- components/RequireRole.vue -->
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

interface Props {
  role: string;
  resource?: string;
  fallback?: boolean;
}

const props = defineProps<Props>();
const { hasRealmRole, hasResourceRole } = useKeycloak();

const hasRole = computed(() => {
  if (props.resource) {
    return hasResourceRole(props.role, props.resource);
  }
  return hasRealmRole(props.role);
});
</script>

<template>
  <div v-if="hasRole">
    <slot />
  </div>
  <div v-else-if="fallback">
    <slot name="fallback">
      <p>You don't have permission to view this content.</p>
    </slot>
  </div>
</template>
```

Usage:

```vue
<script setup lang="ts">
import RequireRole from "@/components/RequireRole.vue";
</script>

<template>
  <RequireRole role="admin">
    <h2>Admin Dashboard</h2>
    <p>Admin-only content here</p>
  </RequireRole>

  <RequireRole role="admin" :fallback="true">
    <h2>Admin Dashboard</h2>

    <template #fallback>
      <p>Access denied. Contact your administrator.</p>
    </template>
  </RequireRole>
</template>
```

## Router Guards

Protect routes based on roles:

```typescript
// router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteLocationNormalized } from "vue-router";
import { useKeycloak } from "keycloak-vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/views/Home.vue"),
    },
    {
      path: "/dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/admin",
      component: () => import("@/views/Admin.vue"),
      meta: {
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "/reports",
      component: () => import("@/views/Reports.vue"),
      meta: {
        requiresAuth: true,
        resourceRoles: [{ role: "view", resource: "reports" }],
      },
    },
    {
      path: "/unauthorized",
      component: () => import("@/views/Unauthorized.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated, isReady, hasRealmRole, hasResourceRole, login } =
    useKeycloak();

  // Wait for Keycloak to be ready
  if (!isReady.value) {
    return next(false);
  }

  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    login({ redirectUri: window.location.origin + to.fullPath });
    return next(false);
  }

  // Check realm roles
  if (to.meta.roles) {
    const roles = to.meta.roles as string[];
    const hasRequiredRole = roles.some((role) => hasRealmRole(role));

    if (!hasRequiredRole) {
      return next("/unauthorized");
    }
  }

  // Check resource roles
  if (to.meta.resourceRoles) {
    const resourceRoles = to.meta.resourceRoles as Array<{
      role: string;
      resource: string;
    }>;
    const hasRequiredRole = resourceRoles.some(({ role, resource }) =>
      hasResourceRole(role, resource)
    );

    if (!hasRequiredRole) {
      return next("/unauthorized");
    }
  }

  next();
});

export default router;
```

## Multiple Roles (AND Logic)

Check if user has all required roles:

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const { hasRealmRole } = useKeycloak();

const hasAllRoles = (roles: string[]) => {
  return roles.every((role) => hasRealmRole(role));
};

const canAccessSensitiveData = computed(() => {
  return hasAllRoles(["admin", "data-viewer"]);
});
</script>

<template>
  <div v-if="canAccessSensitiveData">
    <h2>Sensitive Data</h2>
    <p>Only users with both 'admin' AND 'data-viewer' roles can see this.</p>
  </div>
</template>
```

## Multiple Roles (OR Logic)

Check if user has any of the required roles:

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const { hasRealmRole } = useKeycloak();

const hasAnyRole = (roles: string[]) => {
  return roles.some((role) => hasRealmRole(role));
};

const canManageContent = computed(() => {
  return hasAnyRole(["admin", "editor", "moderator"]);
});
</script>

<template>
  <div v-if="canManageContent">
    <h2>Content Management</h2>
    <p>Users with admin, editor, or moderator roles can manage content.</p>
  </div>
</template>
```

## Composable for Role Management

Create a reusable composable:

```typescript
// src/composables/useRoles.ts
import { computed } from "vue";
import { useKeycloak } from "keycloak-vue";

export function useRoles() {
  const { hasRealmRole, hasResourceRole, realmRoles } = useKeycloak();

  const hasAllRealmRoles = (roles: string[]) => {
    return roles.every((role) => hasRealmRole(role));
  };

  const hasAnyRealmRole = (roles: string[]) => {
    return roles.some((role) => hasRealmRole(role));
  };

  const hasAllResourceRoles = (
    roles: Array<{ role: string; resource?: string }>
  ) => {
    return roles.every(({ role, resource }) => hasResourceRole(role, resource));
  };

  const hasAnyResourceRole = (
    roles: Array<{ role: string; resource?: string }>
  ) => {
    return roles.some(({ role, resource }) => hasResourceRole(role, resource));
  };

  const isAdmin = computed(() => hasRealmRole("admin"));
  const isModerator = computed(() => hasRealmRole("moderator"));
  const isUser = computed(() => hasRealmRole("user"));

  return {
    hasRealmRole,
    hasResourceRole,
    hasAllRealmRoles,
    hasAnyRealmRole,
    hasAllResourceRoles,
    hasAnyResourceRole,
    isAdmin,
    isModerator,
    isUser,
    realmRoles,
  };
}
```

Usage:

```vue
<script setup lang="ts">
import { useRoles } from "@/composables/useRoles";

const { isAdmin, isModerator, hasAnyRealmRole } = useRoles();

const canModerate = computed(() => {
  return hasAnyRealmRole(["admin", "moderator"]);
});
</script>

<template>
  <div>
    <section v-if="isAdmin">
      <h2>Admin Panel</h2>
    </section>

    <section v-if="canModerate">
      <h2>Moderation Tools</h2>
    </section>
  </div>
</template>
```

## Dynamic Navigation

Show navigation items based on roles:

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const { hasRealmRole } = useKeycloak();

interface NavItem {
  label: string;
  path: string;
  role?: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Reports", path: "/reports", role: "viewer" },
  { label: "Admin", path: "/admin", role: "admin" },
];

const visibleNavItems = computed(() => {
  return navItems.filter((item) => {
    if (!item.role) return true;
    return hasRealmRole(item.role);
  });
});
</script>

<template>
  <nav>
    <RouterLink
      v-for="item in visibleNavItems"
      :key="item.path"
      :to="item.path"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>
```

## Role-Based Button Actions

Conditionally enable/disable actions:

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const { hasRealmRole, hasResourceRole } = useKeycloak();

const canEdit = computed(() => hasRealmRole("editor"));
const canDelete = computed(() => hasRealmRole("admin"));
const canPublish = computed(() => hasResourceRole("publish", "content"));

const handleEdit = () => {
  if (canEdit.value) {
    // Edit logic
  }
};

const handleDelete = () => {
  if (canDelete.value) {
    // Delete logic
  }
};
</script>

<template>
  <div>
    <button :disabled="!canEdit" @click="handleEdit">Edit</button>

    <button :disabled="!canDelete" @click="handleDelete">Delete</button>

    <button v-if="canPublish" @click="handlePublish">Publish</button>
  </div>
</template>
```

## Display All User Roles

Show all roles assigned to the user:

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const { realmRoles, resourceAccess } = useKeycloak();
</script>

<template>
  <div>
    <h3>Realm Roles</h3>
    <ul>
      <li v-for="role in realmRoles" :key="role">
        {{ role }}
      </li>
    </ul>

    <h3>Resource Roles</h3>
    <div v-for="(access, resource) in resourceAccess" :key="resource">
      <h4>{{ resource }}</h4>
      <ul>
        <li v-for="role in access.roles" :key="role">
          {{ role }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## Best Practices

1. **Server-Side Validation** - Always validate roles on the server; client-side checks are for UX only
2. **Principle of Least Privilege** - Grant only necessary permissions
3. **Use Composables** - Create reusable composables for complex role logic
4. **Guard Routes** - Protect routes at the router level
5. **Clear Feedback** - Show clear messages when access is denied
6. **Cache Role Checks** - Use computed properties for role checks used multiple times
