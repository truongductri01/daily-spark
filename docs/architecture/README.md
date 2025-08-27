# Daily Spark Architecture Overview

## 🏗️ System Architecture

Daily Spark is built as a modern, scalable learning management system with a clear separation between frontend and backend components.

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │  Azure Functions │    │   Cosmos DB     │
│   (Frontend)    │◄──►│   (Backend)      │◄──►│   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Core Components

### Frontend (React TypeScript)
- **Technology Stack**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system

### Backend (Azure Functions)
- **Runtime**: .NET 8 Isolated Process
- **Pattern**: Serverless Functions with Durable Functions
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage (via Azurite for local development)
- **Authentication**: Custom token-based system

### Database (Cosmos DB)
- **Database**: `daily-spark`
- **Containers**: 
  - `users` - User profiles and metadata
  - `curricula` - Learning curricula and topics
- **Partition Key**: `/PartitionKey` (same as userId)

## 🔄 Data Flow

### User Authentication Flow
```
1. User Login → 2. Token Generation → 3. Local Storage → 4. API Calls
```

### Curriculum Processing Flow
```
1. HTTP Trigger → 2. Orchestrator → 3. Activity Functions → 4. Database → 5. Email → 6. Response
```

## 🏛️ Design Patterns

### 1. **Fan-Out/Fan-In Pattern**
Used in the orchestrator to process multiple users efficiently:
- **Fan-Out**: Start multiple activity functions in parallel
- **Fan-In**: Wait for all activities to complete and collect results

### 2. **Service Layer Pattern**
Centralized business logic in reusable services:
- `UserCurriculumService` - Curriculum processing logic
- `UserFunctionHelpers` - User management operations
- `EmailHelper` - Email formatting and sending

### 3. **Repository Pattern**
Data access abstraction through helper classes:
- Cosmos DB operations abstracted in helper methods
- Consistent error handling and response formatting

### 4. **Observer Pattern**
Frontend state management using React Context:
- Global state management for user authentication
- Real-time UI updates based on state changes

## 🔧 Key Functions

### Orchestrator Functions
- **`ProcessAllUsersOrchestrator`**: Main orchestration for batch processing
- **`GetAllUserIdsActivity`**: Retrieves all user IDs from database
- **`ProcessUserCurriculumTopicsActivity`**: Processes individual user curricula

### HTTP Functions
- **`StartProcessAllUsersClient`**: HTTP trigger for orchestration
- **`QueryCurriculumTopicsByUserId`**: Single user processing (legacy)
- **`UserFunctions`**: User management operations
- **`CurriculumFunctions`**: Curriculum management operations

### Utility Functions
- **`CorsFunction`**: CORS handling for cross-origin requests

## 🛡️ Security Considerations

### Frontend Security
- **Local Storage**: Secure token storage with expiration
- **Input Validation**: Client-side validation with server-side verification
- **CORS**: Properly configured for production domains
- **HTTPS**: Enforced in production environments

### Backend Security
- **Authentication**: Token-based authentication system
- **Authorization**: Role-based access control
- **Input Sanitization**: All inputs validated and sanitized
- **Database Security**: Cosmos DB with proper access controls

### Data Security
- **Encryption**: Data encrypted at rest and in transit
- **Partitioning**: User data properly partitioned for isolation
- **Backup**: Regular automated backups

## 📊 Performance Optimizations

### Database Optimizations
- **Partitioning**: Efficient partition key strategy
- **Indexing**: Optimized query patterns
- **Caching**: User counter system for O(1) operations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Browser caching strategies

### Backend Optimizations
- **Parallel Processing**: Fan-out/fan-in pattern for batch operations
- **Connection Pooling**: Efficient database connections
- **Memory Management**: Proper disposal of resources

## 🔄 Deployment Architecture

### Development Environment
- **Local Functions**: Azure Functions Core Tools
- **Local Storage**: Azurite for Azure Storage emulation
- **Local Database**: Cosmos DB Emulator (optional)

### Production Environment
- **Azure Functions**: Consumption plan for serverless scaling
- **Azure Cosmos DB**: Multi-region deployment
- **Azure Storage**: Blob storage for file management
- **CDN**: Content delivery for static assets

## 📈 Scalability Considerations

### Horizontal Scaling
- **Functions**: Automatic scaling based on demand
- **Database**: Cosmos DB auto-scaling with RU allocation
- **Storage**: Azure Storage with global distribution

### Vertical Scaling
- **Memory**: Configurable memory allocation per function
- **CPU**: Optimized compute resources
- **Network**: Efficient data transfer patterns

## 🔍 Monitoring & Observability

### Logging
- **Application Logs**: Structured logging with correlation IDs
- **Function Logs**: Azure Functions built-in logging
- **Database Logs**: Cosmos DB diagnostic logs

### Metrics
- **Performance**: Response times and throughput
- **Errors**: Error rates and failure patterns
- **Resources**: CPU, memory, and database usage

### Alerting
- **Error Thresholds**: Automated alerts for failures
- **Performance Degradation**: Response time monitoring
- **Resource Utilization**: Capacity planning alerts

## 🚀 Future Architecture Considerations

### Microservices Evolution
- **Service Decomposition**: Breaking down monolithic functions
- **API Gateway**: Centralized API management
- **Service Mesh**: Inter-service communication

### Event-Driven Architecture
- **Event Sourcing**: Audit trail and state reconstruction
- **CQRS**: Command Query Responsibility Segregation
- **Event Streaming**: Real-time data processing

### AI/ML Integration
- **Recommendation Engine**: Personalized learning paths
- **Content Analysis**: Automated curriculum optimization
- **Predictive Analytics**: Learning progress forecasting
