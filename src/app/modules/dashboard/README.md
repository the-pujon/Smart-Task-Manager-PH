# Dashboard Module

## Overview
The Dashboard module provides a comprehensive overview of the entire system, including statistics and latest activities.

## Features

### Dashboard Statistics
- **Total Projects**: Count of all projects in the system
- **Total Tasks**: Count of all tasks in the system
- **Team Members**: Total number of team members
- **Overloaded**: Count of overloaded team members (members with tasks exceeding their capacity)

### Latest Records
- **Latest Teams**: 3 most recently created teams
- **Latest Projects**: 3 most recently created projects (with team information)
- **Latest Activities**: 5 most recent activity logs

## API Endpoints

### Get Dashboard Data
```
GET /api/dashboard
```

**Authorization**: Required (admin, superAdmin, project_manager)

**Query Parameters**:
- `refresh` (optional): Set to "true" to bypass cache and fetch fresh data

**Response**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalProjects": 10,
      "totalTasks": 45,
      "teamMembers": 12,
      "overloaded": 3
    },
    "latestTeams": [
      {
        "_id": "...",
        "name": "Development Team",
        "totalMembers": 5,
        "totalProjects": 3,
        "createdAt": "2025-11-19T10:30:00Z"
      }
    ],
    "latestProjects": [
      {
        "_id": "...",
        "name": "E-commerce Platform",
        "description": "Building a new e-commerce platform",
        "status": "Active",
        "assignedTeam": {
          "_id": "...",
          "name": "Development Team"
        },
        "createdAt": "2025-11-19T10:30:00Z"
      }
    ],
    "latestActivities": [
      {
        "_id": "...",
        "activityType": "TASK_ASSIGNED",
        "description": "Task assigned to member",
        "user": {
          "_id": "...",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "project": {
          "_id": "...",
          "name": "E-commerce Platform"
        },
        "task": {
          "_id": "...",
          "title": "Implement payment gateway"
        },
        "createdAt": "2025-11-19T10:30:00Z"
      }
    ]
  }
}
```

### Clear Dashboard Cache
```
DELETE /api/dashboard/cache
```

**Authorization**: Required (admin, superAdmin)

**Response**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Dashboard cache cleared successfully",
  "data": null
}
```

## Caching

The dashboard data is cached for 5 minutes (300 seconds) to improve performance. The cache is automatically managed:

- Data is cached after first fetch
- Cache can be bypassed using `?refresh=true` query parameter
- Cache can be manually cleared by admins via the `/cache` endpoint
- Cache should be invalidated when creating/updating/deleting related records

### Invalidating Cache Programmatically

You can invalidate the dashboard cache from other modules when data changes:

```typescript
import { invalidateDashboardCache } from '../dashboard/dashboard.utils';

// After creating/updating/deleting records
await invalidateDashboardCache();
```

## Configuration

Dashboard settings can be modified in `dashboard.config.ts`:

```typescript
export const DASHBOARD_CONFIG = {
  LATEST_TEAMS_LIMIT: 3,        // Number of latest teams to fetch
  LATEST_PROJECTS_LIMIT: 3,     // Number of latest projects to fetch
  LATEST_ACTIVITIES_LIMIT: 5,   // Number of latest activities to fetch
  CACHE_TTL: 300,                // Cache time-to-live in seconds
  CACHE_KEY_PREFIX: 'dashboard', // Redis cache key prefix
};
```

## Performance Considerations

- All database queries are executed in parallel for optimal performance
- Redis caching reduces database load for frequently accessed data
- Pagination is not needed as results are limited by configuration
- Lean queries are used for better performance

## Security

- Authentication is required for all endpoints
- Only authorized roles (admin, superAdmin, project_manager) can access dashboard data
- Cache clearing is restricted to admin and superAdmin roles

## Dependencies

- **Models**: Project, Task, Member, Team, ActivityLog
- **Utils**: Redis caching utilities
- **Middleware**: Authentication middleware

## Usage Example

```typescript
// Fetch dashboard data
const response = await fetch('/api/dashboard', {
  headers: {
    'Authorization': 'Bearer <token>',
  },
});

// Fetch fresh data bypassing cache
const freshData = await fetch('/api/dashboard?refresh=true', {
  headers: {
    'Authorization': 'Bearer <token>',
  },
});

// Clear cache (admin only)
await fetch('/api/dashboard/cache', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer <token>',
  },
});
```

## Error Handling

The module includes comprehensive error handling:
- Returns 500 if database queries fail
- Returns 401 if authentication is missing or invalid
- Returns 403 if user lacks required permissions
- Logs errors for debugging purposes
