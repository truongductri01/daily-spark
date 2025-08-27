# Curriculum Upload Validation Test

## Overview
This document tests the curriculum upload validation fix to ensure the provided JSON example is accepted.

## Test JSON (Should Be Accepted)
```json
{
    "courseTitle": "System Design Basics",
    "topics": [
        {
            "id": "first-topic",
            "title": "What is System Design?",
            "description": "An overview of system design concepts.",
            "estimatedTime": 600,
            "question": "Explain the difference between high-level and low-level design.",
            "resources": [
                "https://example.com/system-design-intro"
            ],
            "status": "NotStarted"
        }
    ]
}
```

## Key Changes Made

### 1. Relaxed estimatedTime Validation
- **Before**: Only accepted string values
- **After**: Accepts both string and number values
- **Example**: `"estimatedTime": 600` (number) is now valid

### 2. Fixed Preview Normalization
- **Issue**: The `normalizeCurriculumForPreview` function was converting number `estimatedTime` to empty string
- **Fix**: Updated to preserve both string and number types for `estimatedTime`
- **Result**: Numbers like `600` are now properly preserved during preview and validation

### 2. Validation Logic Updated
```typescript
// Old validation
if (typeof topic.estimatedTime !== 'string' || topic.estimatedTime.trim() === '') {
  setError(`Topic ${i + 1} estimatedTime must be a non-empty string`);
  return null;
}

// New validation
if (typeof topic.estimatedTime !== 'string' && typeof topic.estimatedTime !== 'number') {
  setError(`Topic ${i + 1} estimatedTime must be a string or number`);
  return null;
}

if (typeof topic.estimatedTime === 'string' && topic.estimatedTime.trim() === '') {
  setError(`Topic ${i + 1} estimatedTime must be a non-empty string`);
  return null;
}
```

### 3. Preview Normalization Fixed
```typescript
// Old normalization (converted numbers to empty string)
estimatedTime: typeof t?.estimatedTime === 'string' ? t.estimatedTime : '',

// New normalization (preserves both string and number)
estimatedTime: typeof t?.estimatedTime === 'string' || typeof t?.estimatedTime === 'number' ? t.estimatedTime : '',
```

## Test Scenarios

### ✅ Should Pass (Valid JSON)
1. **Number estimatedTime**: `"estimatedTime": 600`
2. **String estimatedTime**: `"estimatedTime": "600"`
3. **Mixed types**: Different topics can have different types
4. **With optional fields**: `id`, `status` fields are ignored but don't cause errors

### ❌ Should Fail (Invalid JSON)
1. **Missing courseTitle**: `{}`
2. **Empty topics array**: `{"courseTitle": "Test", "topics": []}`
3. **Invalid estimatedTime**: `"estimatedTime": null`
4. **Missing required fields**: Missing `title`, `description`, `question`

## How to Test

1. **Start the frontend**: `npm start`
2. **Navigate to**: `/upload` page
3. **Paste the test JSON** into the text area
4. **Verify**: 
   - No validation errors appear
   - Preview shows the curriculum correctly
   - Create button is enabled
   - estimatedTime shows as 600 (converted from number)

## Expected Behavior

- ✅ **Validation**: No errors for the test JSON
- ✅ **Preview**: Curriculum displays correctly in preview
- ✅ **Conversion**: `estimatedTime: 600` (number) converts to `600` (number) in the final data
- ✅ **Creation**: Can successfully create curriculum with the data

## Backward Compatibility

- ✅ **String estimatedTime**: Still works (`"estimatedTime": "600"`)
- ✅ **All existing validations**: Still enforced (title, description, question, etc.)
- ✅ **Error messages**: Clear and helpful for invalid data
