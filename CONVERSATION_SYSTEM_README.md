# Conversation System Implementation

## Overview
This document describes the implementation of a comprehensive conversation system for storing and managing conversations between users and departments for specific queries in the Jansunwai Indore application.

## Features Implemented

### 1. **Conversation Storage**
- Conversations are stored in the `objects` array within each Query document
- Each conversation includes:
  - `message`: The actual message content
  - `authorType`: Either "User" or "DepartmentMember"
  - `authorId`: Reference to the author (User or DepartmentMember)
  - `timestamp`: When the message was sent
  - `attachments`: Optional file attachments

### 2. **API Endpoints**

#### `/api/conversations/[queryId]` (Main endpoint)
- **GET**: Fetch conversations for a specific query with optional author details
- **POST**: Add a new conversation to a query

#### `/api/queries/[id]/conversations` (Legacy endpoint)
- Maintained for backward compatibility
- Same functionality as main endpoint

### 3. **Real-time Updates**
- Polling mechanism every 5 seconds to check for new messages
- Automatic status updates (open → in_progress when department responds)
- Real-time conversation synchronization between users and departments

### 4. **Author Information**
- Author names are populated for better user experience
- Fallback to generic labels if author details unavailable
- Proper distinction between user and department messages

## Database Schema Updates

### ThreadObjectSchema
```javascript
const ThreadObjectSchema = new Schema({
  message: { type: String, required: true },
  authorType: {
    type: String,
    enum: ["User", "DepartmentMember"],
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "objects.authorType",
  },
  timestamp: { type: Date, default: Date.now },
  attachments: [
    new Schema({
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
      url: { type: String, required: true },
    }, { _id: false }),
  ],
}, { _id: false });
```

## Frontend Integration

### User Dashboard (`app/dashboard/page.js`)
- Uses `/api/conversations/[queryId]` endpoint
- Real-time conversation updates
- Proper author name display
- Automatic scrolling to new messages

### Department Dashboard (`app/department/dashboard/page.js`)
- Same conversation API integration
- Real-time updates for department members
- Automatic status management
- Proper conversation threading

## API Usage Examples

### Adding a New Conversation
```javascript
const response = await fetch(`/api/conversations/${queryId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Your message here",
    authorId: "user_or_department_member_id",
    authorType: "User" // or "DepartmentMember"
  })
});
```

### Fetching Conversations
```javascript
const response = await fetch(`/api/conversations/${queryId}?includeAuthorDetails=true`);
const data = await response.json();
// data.conversations contains all conversations
// data.query contains query details
```

## Status Management

### Automatic Status Updates
- **Open → In Progress**: When a department member responds to an open query
- **Status Persistence**: All status changes are stored in the database
- **Real-time Updates**: Status changes are reflected immediately in the UI

## Error Handling

### Fallback Mechanisms
- If conversation API fails, falls back to query objects
- Graceful degradation for better user experience
- Comprehensive error logging for debugging

### API Error Responses
- Proper HTTP status codes
- Descriptive error messages
- Validation for required fields

## Security Features

### Input Validation
- Author type validation (User/DepartmentMember only)
- Required field validation
- MongoDB injection protection

### Access Control
- Proper authentication checks
- Author ID validation
- Query ownership verification

## Performance Optimizations

### Efficient Queries
- Selective field population
- Indexed queries for better performance
- Minimal data transfer

### Real-time Updates
- Smart polling (only when query is selected)
- Efficient change detection
- Automatic cleanup of intervals

## Future Enhancements

### Planned Features
1. **WebSocket Integration**: Replace polling with real-time WebSocket updates
2. **Push Notifications**: Notify users of new messages
3. **Message Encryption**: End-to-end encryption for sensitive conversations
4. **File Upload**: Direct file attachment support in conversations
5. **Message Search**: Search within conversations
6. **Conversation Analytics**: Track response times and engagement

### Scalability Considerations
- Database indexing for large conversation volumes
- Pagination for long conversation threads
- Caching for frequently accessed conversations
- Rate limiting for API endpoints

## Testing

### API Testing
- Test all endpoints with valid/invalid data
- Verify error handling and validation
- Test real-time update mechanisms

### Frontend Testing
- Test conversation display and updates
- Verify real-time synchronization
- Test error scenarios and fallbacks

## Deployment Notes

### Environment Variables
- Ensure MongoDB connection string is properly configured
- Set appropriate timeout values for API calls
- Configure polling intervals based on requirements

### Database Migration
- No breaking changes to existing data
- Backward compatible with existing queries
- Gradual migration path available

## Troubleshooting

### Common Issues
1. **Conversations not updating**: Check polling mechanism and API endpoints
2. **Author names not showing**: Verify authorDetails population
3. **Real-time updates not working**: Check interval cleanup and error handling

### Debug Information
- Check browser console for API errors
- Verify database connections
- Monitor API response times

## Support

For technical support or questions about the conversation system, please refer to:
- API documentation
- Database schema documentation
- Frontend component documentation

