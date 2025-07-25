# Tournament API Documentation

## Overview

This document describes the REST API endpoints for the DayTrade tournament system. The API provides comprehensive functionality for tournament management, participant registration, leaderboards, performance tracking, notifications, configuration management, and audit logging.

## Base URL

```
/api/tournaments
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- 100 requests per minute per IP address
- Rate limit headers included in responses

## Response Format

All responses follow this standard format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string (only on failure)
}
```

## Tournament Management

### Create Tournament

**POST** `/tournaments`

Creates a new tournament. Requires admin privileges.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "startDate": "ISO 8601 date string (required)",
  "endDate": "ISO 8601 date string (required)",
  "maxParticipants": "number (optional)",
  "entryFee": "decimal string (optional)",
  "prizePool": "decimal string (optional)",
  "rules": "string (optional)",
  "slug": "string (required)",
  "division": "BEGINNER | INTERMEDIATE | ADVANCED | PROFESSIONAL (required)",
  "registrationOpenDate": "ISO 8601 date string (required)",
  "registrationCloseDate": "ISO 8601 date string (required)",
  "tradingSymbols": "array of strings (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "startDate": "ISO 8601 date",
    "endDate": "ISO 8601 date",
    "status": "DRAFT",
    "maxParticipants": "number",
    "entryFee": "decimal",
    "prizePool": "decimal",
    "rules": "string",
    "slug": "string",
    "division": "enum",
    "registrationOpenDate": "ISO 8601 date",
    "registrationCloseDate": "ISO 8601 date",
    "tradingSymbols": ["string"],
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

### Get Tournament

**GET** `/tournaments/:id`

Retrieves tournament details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "startDate": "ISO 8601 date",
    "endDate": "ISO 8601 date",
    "status": "enum",
    "maxParticipants": "number",
    "currentParticipants": "number",
    "entryFee": "decimal",
    "prizePool": "decimal",
    "rules": "string",
    "slug": "string",
    "division": "enum",
    "registrationOpenDate": "ISO 8601 date",
    "registrationCloseDate": "ISO 8601 date",
    "tradingSymbols": ["string"]
  }
}
```

### Update Tournament

**PUT** `/tournaments/:id`

Updates tournament details. Requires admin privileges.

**Request Body:** Same as create tournament (all fields optional)

### Delete Tournament

**DELETE** `/tournaments/:id`

Deletes a tournament. Requires admin privileges.

**Response:**
```json
{
  "success": true,
  "message": "Tournament deleted successfully"
}
```

## Tournament Status Management

### Start Tournament

**POST** `/tournaments/:id/start`

Starts a tournament (changes status to ACTIVE). Requires admin privileges.

### End Tournament

**POST** `/tournaments/:id/end`

Ends a tournament (changes status to COMPLETED). Requires admin privileges.

## Participant Management

### Register Participant

**POST** `/tournaments/:id/register`

Registers a user for a tournament.

**Request Body:**
```json
{
  "userId": "uuid (required)"
}
```

### Get Participants

**GET** `/tournaments/:id/participants`

Retrieves all participants for a tournament.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tournamentId": "uuid",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "email": "string"
      },
      "registrationDate": "ISO 8601 date",
      "currentRank": "number",
      "totalReturn": "decimal",
      "isActive": "boolean"
    }
  ]
}
```

## Leaderboard

### Get Tournament Leaderboard

**GET** `/tournaments/:id/leaderboard?limit=50`

Retrieves tournament leaderboard with participant rankings.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "tournamentId": "uuid",
    "lastUpdated": "ISO 8601 date",
    "entries": [
      {
        "rank": "number",
        "participantId": "uuid",
        "userId": "uuid",
        "userName": "string",
        "totalReturn": "decimal",
        "totalTrades": "number",
        "winRate": "decimal",
        "sharpeRatio": "decimal"
      }
    ]
  }
}
```

### Update Rankings

**POST** `/tournaments/:id/update-rankings`

Manually triggers ranking update for a tournament. Requires admin privileges.

## Performance Tracking

### Record Performance

**POST** `/performance`

Records trading performance data for a participant.

**Request Body:**
```json
{
  "participantId": "uuid (required)",
  "totalReturn": "decimal string (required)",
  "totalTrades": "number (required)",
  "winningTrades": "number (required)",
  "losingTrades": "number (required)",
  "largestWin": "decimal string (required)",
  "largestLoss": "decimal string (required)",
  "averageWin": "decimal string (required)",
  "averageLoss": "decimal string (required)",
  "winRate": "decimal string (required)",
  "profitFactor": "decimal string (required)",
  "sharpeRatio": "decimal string (required)",
  "maxDrawdown": "decimal string (required)",
  "portfolioValue": "decimal string (required)"
}
```

### Get Performance Snapshot

**GET** `/performance/participant/:id?tournamentId=uuid`

Retrieves current performance snapshot for a participant.

**Query Parameters:**
- `tournamentId` (required): Tournament ID

## Notifications

### Get Notifications

**GET** `/notifications?userId=uuid&type=string&isRead=boolean&limit=50&offset=0`

Retrieves notifications for a user.

**Query Parameters:**
- `userId` (required): User ID
- `type` (optional): Notification type filter
- `isRead` (optional): Filter by read status
- `limit` (optional): Number of notifications (default: 50)
- `offset` (optional): Pagination offset (default: 0)

### Mark Notification as Read

**POST** `/notifications/:id/read`

Marks a notification as read.

### Get Unread Count

**GET** `/notifications/unread-count/:userId`

Gets the count of unread notifications for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": "number"
  }
}
```

## Configuration Management (Admin Only)

### Get Configuration

**GET** `/config/:key`

Retrieves a specific configuration value. Requires admin privileges.

### Get All Configurations

**GET** `/config`

Retrieves all configuration values. Requires admin privileges.

## Audit Logging (Admin Only)

### Get Audit Logs

**GET** `/audit?userId=uuid&action=string&entityType=string&entityId=uuid&startDate=date&endDate=date&limit=100&offset=0`

Retrieves audit logs with optional filtering. Requires admin privileges.

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `entityType` (optional): Filter by entity type
- `entityId` (optional): Filter by entity ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `limit` (optional): Number of logs (default: 100)
- `offset` (optional): Pagination offset (default: 0)

## Health Check

### Health Check

**GET** `/health`

Returns API health status.

**Response:**
```json
{
  "success": true,
  "message": "Tournament API is healthy",
  "timestamp": "ISO 8601 date"
}
```

## Error Codes

- `400` - Bad Request (validation errors, business logic violations)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (insufficient privileges)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Tournament Status Values

- `DRAFT` - Tournament created but not yet open for registration
- `REGISTRATION_OPEN` - Registration is open
- `REGISTRATION_CLOSED` - Registration closed, tournament not yet started
- `ACTIVE` - Tournament is currently running
- `COMPLETED` - Tournament has ended
- `CANCELLED` - Tournament was cancelled

## Division Values

- `BEGINNER` - Entry level traders
- `INTERMEDIATE` - Experienced traders
- `ADVANCED` - Expert traders
- `PROFESSIONAL` - Professional traders

## Notification Types

- `TOURNAMENT_REGISTRATION` - Tournament registration confirmation
- `TOURNAMENT_START` - Tournament has started
- `TOURNAMENT_END` - Tournament has ended
- `RANK_CHANGE` - Participant rank has changed
- `GENERAL` - General system notifications

## Rate Limiting Headers

All responses include rate limiting headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Validation Rules

### Tournament Creation/Update
- `name`: 1-200 characters
- `description`: Max 1000 characters
- `startDate`: Must be in the future
- `endDate`: Must be after start date
- `maxParticipants`: 1-10000
- `entryFee`: Non-negative decimal
- `prizePool`: Non-negative decimal
- `slug`: Unique, URL-safe string
- `tradingSymbols`: Array of valid trading symbols

### Performance Data
- All decimal values must be valid numbers
- Trade counts must be non-negative integers
- Win rate must be between 0 and 1
- Ratios must be valid decimal numbers

## Security Considerations

- All endpoints require authentication
- Admin endpoints require additional authorization
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- Audit logging tracks all actions
- Sensitive data is not logged