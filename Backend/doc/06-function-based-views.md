# Function-Based Views Implementation Guide

**Document Version**: 2.0  
**Last Updated**: 2025

This guide documents the implementation of function-based views in the ResumeAnalyzer API.

## Table of Contents

1. [Overview](#overview)
2. [Key Changes](#key-changes-made)
3. [Implementation](#function-based-views-implementation)
4. [Query Parameters](#query-parameter-validation)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Usage Examples](#usage-examples)


The Django Task Manager API has been successfully converted from class-based views to function-based views using Django REST Framework's `@api_view` decorator. This implementation provides enhanced query parameter support for advanced filtering, searching, and ordering capabilities.

## Key Changes Made

### 1. View Architecture
- **Before**: Class-based views (`generics.ListCreateAPIView`, `generics.RetrieveUpdateDestroyAPIView`)
- **After**: Function-based views with `@api_view` decorators

### 2. URL Structure Updates
- **Before**: Single endpoints for multiple operations
- **After**: Separate endpoints for better clarity

| Operation | Old Endpoint | New Endpoint |
|-----------|--------------|--------------|
| List/Create | `/api/tasks/` | `/api/tasks/` |
| Retrieve | `/api/tasks/{id}/` | `/api/tasks/{id}/` |
| Update | `/api/tasks/{id}/` | `/api/tasks/{id}/update/` |
| Delete | `/api/tasks/{id}/` | `/api/tasks/{id}/delete/` |

### 3. Enhanced Query Parameters

#### Filtering Options
```python
# Completion status filtering
?completed=true          # Show only completed tasks
?completed=false         # Show only incomplete tasks

# Text search (searches in title AND description)
?search=keyword          # Case-insensitive search

# Date range filtering
?created_after=2024-01-01    # Tasks created after date
?created_before=2024-12-31   # Tasks created before date

# Ordering (ascending/descending)
?ordering=title              # Order by title A-Z
?ordering=-title             # Order by title Z-A
?ordering=created_at         # Order by creation date (oldest first)
?ordering=-created_at        # Order by creation date (newest first)

# Pagination
?page=2                      # Get page 2 of results
```

#### Combining Parameters
```python
# Complex filtering example
/api/tasks/?completed=false&search=django&ordering=-created_at&page=1
```

## Function-Based Views Implementation

### 1. Task List & Create View
```python
@api_view(['GET', 'POST'])
def task_list_create(request):
    """
    GET: List tasks with filtering, searching, ordering, and pagination
    POST: Create a new task
    """
```

**Features:**
- Advanced filtering by completion status
- Full-text search in title and description
- Date range filtering
- Flexible ordering by any field
- Pagination with detailed metadata
- Comprehensive error handling

### 2. Task Detail View
```python
@api_view(['GET'])
def task_detail(request, pk):
    """
    GET: Retrieve a specific task by ID
    """
```

### 3. Task Update View
```python
@api_view(['PUT', 'PATCH'])
def task_update(request, pk):
    """
    PUT: Full update (all fields required)
    PATCH: Partial update (only provided fields)
    """
```

### 4. Task Delete View
```python
@api_view(['DELETE'])
def task_delete(request, pk):
    """
    DELETE: Remove a task by ID
    """
```

## Query Parameter Validation

### Built-in Validation Functions

#### 1. Boolean Parameter Validation
```python
def validate_boolean_parameter(bool_string, param_name):
    """
    Accepts: 'true', 'false', '1', '0', 'yes', 'no' (case-insensitive)
    Returns: Boolean value
    Raises: ValueError for invalid values
    """
```

#### 2. Date Parameter Validation
```python
def validate_date_parameter(date_string, param_name):
    """
    Accepts: YYYY-MM-DD format
    Returns: datetime.date object
    Raises: ValueError for invalid format
    """
```

#### 3. Ordering Parameter Validation
```python
def validate_ordering_parameter(ordering_string):
    """
    Valid fields: 'id', 'title', 'completed', 'created_at', 'updated_at'
    Supports: field_name or -field_name (for descending)
    Returns: Validated ordering string
    Raises: ValueError for invalid fields
    """
```

## Error Handling

### Query Parameter Errors
```json
{
    "error": "Invalid completed value. Use 'true' or 'false'."
}
```

### Validation Errors
```json
{
    "error": "Validation failed",
    "details": {
        "title": ["This field is required."]
    }
}
```

### Not Found Errors
```json
{
    "error": "Task not found"
}
```

### Pagination Errors
```json
{
    "error": "Page 5 does not exist. Total pages: 2"
}
```

## Response Formats

### List Response (with Pagination)
```json
{
    "count": 25,
    "next": 3,
    "previous": 1,
    "total_pages": 5,
    "current_page": 2,
    "results": [
        {
            "id": 1,
            "title": "Task Title",
            "description": "Task Description",
            "completed": false,
            "created_at": "2024-01-01T12:00:00Z",
            "updated_at": "2024-01-01T12:00:00Z"
        }
    ]
}
```

### Single Task Response
```json
{
    "id": 1,
    "title": "Task Title",
    "description": "Task Description",
    "completed": false,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
}
```

## Testing

### Updated Test Suite
The test suite has been updated to cover:
- All function-based view endpoints
- Query parameter validation
- Error handling scenarios
- Combined filtering operations
- Pagination functionality

### Running Tests
```bash
# Run all tests
python manage.py test

# Run specific test class
python manage.py test tasks.tests.TaskAPITestCase

# Run with verbose output
python manage.py test --verbosity=2
```

### API Testing Script
Use the updated `test_api.py` script to test all functionality:
```bash
python test_api.py
```

## Usage Examples

### 1. Basic Operations
```bash
# List all tasks
curl "http://127.0.0.1:8000/api/tasks/"

# Create a task
curl -X POST "http://127.0.0.1:8000/api/tasks/" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description"}'

# Get specific task
curl "http://127.0.0.1:8000/api/tasks/1/"

# Update task (partial)
curl -X PATCH "http://127.0.0.1:8000/api/tasks/1/update/" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete task
curl -X DELETE "http://127.0.0.1:8000/api/tasks/1/delete/"
```

### 2. Advanced Filtering
```bash
# Filter completed tasks
curl "http://127.0.0.1:8000/api/tasks/?completed=true"

# Search for tasks containing "django"
curl "http://127.0.0.1:8000/api/tasks/?search=django"

# Get tasks created after January 1, 2024
curl "http://127.0.0.1:8000/api/tasks/?created_after=2024-01-01"

# Order by title (A-Z)
curl "http://127.0.0.1:8000/api/tasks/?ordering=title"

# Order by creation date (newest first)
curl "http://127.0.0.1:8000/api/tasks/?ordering=-created_at"

# Complex filtering
curl "http://127.0.0.1:8000/api/tasks/?completed=false&search=project&ordering=-created_at&page=1"
```

## Benefits of Function-Based Views

### 1. **Simplicity and Clarity**
- Easier to understand and debug
- More explicit control flow
- Clearer separation of concerns

### 2. **Flexibility**
- Custom logic implementation
- Advanced query parameter handling
- Tailored error responses

### 3. **Performance**
- Direct database query optimization
- Custom pagination logic
- Efficient filtering implementation

### 4. **Maintainability**
- Easier to modify specific endpoints
- Clear function boundaries
- Better code organization

## Migration Notes

### What Stayed the Same
- Task model structure
- Serializer implementation
- Database schema
- Admin interface
- Authentication requirements (none currently)

### What Changed
- View implementation (class-based → function-based)
- URL patterns (separate update/delete endpoints)
- Query parameter support (enhanced)
- Error handling (more detailed)
- Response format (enhanced pagination metadata)

## Future Enhancements

### Possible Additions
1. **Authentication & Authorization**
   - User-based task filtering
   - Permission-based access control

2. **Advanced Search**
   - Full-text search with ranking
   - Multiple field search combinations

3. **Bulk Operations**
   - Bulk create/update/delete
   - Batch status changes

4. **Export/Import**
   - CSV/JSON export with filtering
   - Bulk import functionality

5. **Real-time Features**
   - WebSocket support for live updates
   - Push notifications

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Query optimization for filtering
- Pagination to limit result sets

### Caching Strategies
- Redis for frequently accessed data
- Query result caching
- API response caching

### Monitoring
- Query performance tracking
- API response time monitoring
- Error rate tracking

---

**Version**: 2.0 (Function-Based Views)  
**Last Updated**: 2025  
**Status**: ✅ Production Ready
