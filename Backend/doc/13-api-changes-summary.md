# API Changes Summary - GET/POST Only Design

## Overview

The Resume Analyzer Backend API has been redesigned to use **only GET and POST methods** with all identifiers passed as query parameters or in the request body, rather than as URL path parameters.

## Key Changes

### 1. HTTP Methods
- **Before:** GET, POST, PUT, DELETE, PATCH
- **After:** GET, POST only

### 2. URL Structure
- **Before:** `/api/academics/<uuid:id>` (ID in URL path)
- **After:** `/api/academics?id=<uuid>` (ID in query parameter)

### 3. POST Request Actions
All POST requests now use an `action` field to specify the operation:
- `create`: Create new record (default)
- `update`: Update existing record
- `delete`: Delete record
- `reorder`: Reorder items
- `add`/`remove`: For skills operations
- `upload`/`delete`: For file operations

## Detailed Changes by Endpoint

### Basic Information
| Old | New |
|-----|-----|
| `GET /api/applicant-info/basic` | `GET /api/applicant-info/basic` (unchanged) |
| `PUT /api/applicant-info/basic` | `POST /api/applicant-info/basic` |

### Academics
| Old | New |
|-----|-----|
| `GET /api/applicant-info/academics` | `GET /api/applicant-info/academics` |
| `GET /api/applicant-info/academics/<id>` | `GET /api/applicant-info/academics?id=<uuid>` |
| `POST /api/applicant-info/academics` | `POST /api/applicant-info/academics` (action=create) |
| `PUT /api/applicant-info/academics/<id>` | `POST /api/applicant-info/academics` (action=update, id in body) |
| `DELETE /api/applicant-info/academics/<id>` | `POST /api/applicant-info/academics` (action=delete, id in body) |
| `PATCH /api/applicant-info/academics/reorder` | `POST /api/applicant-info/academics` (action=reorder) |

### Achievements
| Old | New |
|-----|-----|
| `GET /api/applicant-info/achievements` | `GET /api/applicant-info/achievements` |
| `GET /api/applicant-info/achievements/<id>` | `GET /api/applicant-info/achievements?id=<uuid>` |
| `POST /api/applicant-info/achievements` | `POST /api/applicant-info/achievements` (action=create) |
| `PUT /api/applicant-info/achievements/<id>` | `POST /api/applicant-info/achievements` (action=update) |
| `DELETE /api/applicant-info/achievements/<id>` | `POST /api/applicant-info/achievements` (action=delete) |
| `PATCH /api/applicant-info/achievements/reorder` | `POST /api/applicant-info/achievements` (action=reorder) |

### Skills
| Old | New |
|-----|-----|
| `GET /api/skills` | `GET /api/skills` (unchanged) |
| `POST /api/skills` | `POST /api/skills` (unchanged) |
| `GET /api/applicant-info/skills` | `GET /api/applicant-info/skills` (unchanged) |
| `POST /api/applicant-info/skills` | `POST /api/applicant-info/skills` (action=add) |
| `DELETE /api/applicant-info/skills` | `POST /api/applicant-info/skills` (action=remove) |

### Projects
| Old | New |
|-----|-----|
| `GET /api/applicant-info/projects` | `GET /api/applicant-info/projects` |
| `GET /api/applicant-info/projects/<id>` | `GET /api/applicant-info/projects?id=<uuid>` |
| `POST /api/applicant-info/projects` | `POST /api/applicant-info/projects` (action=create) |
| `PUT /api/applicant-info/projects/<id>` | `POST /api/applicant-info/projects` (action=update) |
| `DELETE /api/applicant-info/projects/<id>` | `POST /api/applicant-info/projects` (action=delete) |
| `PATCH /api/applicant-info/projects/reorder` | `POST /api/applicant-info/projects` (action=reorder) |

### Experiences
| Old | New |
|-----|-----|
| `GET /api/applicant-info/experiences` | `GET /api/applicant-info/experiences` |
| `GET /api/applicant-info/experiences/<id>` | `GET /api/applicant-info/experiences?id=<uuid>` |
| `POST /api/applicant-info/experiences` | `POST /api/applicant-info/experiences` (action=create) |
| `PUT /api/applicant-info/experiences/<id>` | `POST /api/applicant-info/experiences` (action=update) |
| `DELETE /api/applicant-info/experiences/<id>` | `POST /api/applicant-info/experiences` (action=delete) |
| `PATCH /api/applicant-info/experiences/reorder` | `POST /api/applicant-info/experiences` (action=reorder) |

### Applications
| Old | New |
|-----|-----|
| `GET /api/applications` | `GET /api/applications` |
| `GET /api/applications/<id>` | `GET /api/applications?id=<uuid>` |
| `POST /api/applications` | `POST /api/applications` (action=create) |
| `PUT /api/applications/<id>` | `POST /api/applications` (action=update) |
| `DELETE /api/applications/<id>` | `POST /api/applications` (action=delete) |

### Resume Files
| Old | New |
|-----|-----|
| `POST /api/applications/<id>/resume/upload` | `POST /api/resume` (action=upload, id in form data) |
| `GET /api/applications/<id>/resume/download` | `GET /api/resume?id=<uuid>` |
| `DELETE /api/applications/<id>/resume` | `POST /api/resume` (action=delete, id in form data) |

### Statistics
| Old | New |
|-----|-----|
| `GET /api/applications/stats` | `GET /api/applications/stats` (unchanged) |

## Example Usage Changes

### Before (Old API)

```bash
# Update academic
curl -X PUT http://localhost:8000/api/applicant-info/academics/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"collegeName": "MIT"}'

# Delete academic
curl -X DELETE http://localhost:8000/api/applicant-info/academics/550e8400-e29b-41d4-a716-446655440000

# Get single academic
curl http://localhost:8000/api/applicant-info/academics/550e8400-e29b-41d4-a716-446655440000
```

### After (New API)

```bash
# Update academic
curl -X POST http://localhost:8000/api/applicant-info/academics \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "collegeName": "MIT"
  }'

# Delete academic
curl -X POST http://localhost:8000/api/applicant-info/academics \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete",
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }'

# Get single academic
curl "http://localhost:8000/api/applicant-info/academics?id=550e8400-e29b-41d4-a716-446655440000"
```

## Benefits of New Design

### 1. Simplicity
- Only 2 HTTP methods to handle
- No need to configure multiple HTTP methods per endpoint
- Easier to understand and implement

### 2. Firewall Friendly
- Many corporate firewalls only allow GET and POST
- No issues with PUT, DELETE, or PATCH being blocked

### 3. Consistent Patterns
- All write operations use POST with action field
- All IDs passed the same way (query params or body)
- Predictable URL structure

### 4. Flexibility
- Easy to add new actions without changing URLs
- Can batch multiple operations in future
- Action field makes intent explicit

### 5. Clean URLs
- No UUID segments in URLs
- Easier to document and remember
- Better for API versioning

## Migration Guide for Frontend

### Step 1: Update HTTP Methods
Replace all PUT, DELETE, PATCH calls with POST:

```javascript
// Before
fetch(`/api/academics/${id}`, { method: 'PUT', body: data })
fetch(`/api/academics/${id}`, { method: 'DELETE' })

// After
fetch('/api/academics', { 
  method: 'POST', 
  body: JSON.stringify({ action: 'update', id, ...data })
})
fetch('/api/academics', { 
  method: 'POST', 
  body: JSON.stringify({ action: 'delete', id })
})
```

### Step 2: Update URLs
Move IDs from URL path to query parameters or body:

```javascript
// Before (GET)
fetch(`/api/academics/${id}`)

// After (GET)
fetch(`/api/academics?id=${id}`)

// Before (POST/PUT/DELETE)
fetch(`/api/academics/${id}`, { method: 'PUT', body: data })

// After (POST)
fetch('/api/academics', { 
  method: 'POST', 
  body: JSON.stringify({ action: 'update', id, ...data })
})
```

### Step 3: Add Action Field
Include `action` field in all POST requests:

```javascript
// Create
fetch('/api/academics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',  // or omit for default
    collegeName: 'MIT',
    // ...
  })
})

// Update
fetch('/api/academics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update',
    id: academicId,
    collegeName: 'MIT',
    // ...
  })
})

// Delete
fetch('/api/academics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'delete',
    id: academicId
  })
})
```

## Files Updated

1. **BackendApp/views.py** - Complete rewrite with new structure
2. **BackendApp/urls.py** - Simplified URL patterns
3. **doc/09-api-documentation.md** - Updated with new API design
4. **doc/10-quick-start-api.md** - Updated with new examples
5. **doc/11-implementation-summary.md** - Updated implementation details
6. **doc/12-readme-api.md** - Updated quick reference

## Backward Compatibility

⚠️ **Breaking Changes**: This is a major API redesign and is NOT backward compatible with the previous API version.

Frontend applications must be updated to work with the new API structure.

## Testing

Run the system check:
```bash
python manage.py check
```

Test the new API:
```bash
# Start server
python manage.py runserver

# In another terminal, test endpoints
curl http://localhost:8000/api/applicant-info/complete
```

## Support

For questions or issues:
- See `doc/09-api-documentation.md` for complete API reference
- See `doc/10-quick-start-api.md` for quick start guide
- Check Django logs for errors

---

**Version:** 2.0 (GET/POST Only)  
**Date:** 2025  
**Status:** ✅ Complete

