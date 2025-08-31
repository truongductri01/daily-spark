# Daily Spark
> Your Partner in Daily Learning

Daily Spark is a personal learning assistant that helps you stay consistent and achieve your goals by creating structured learning curricula and sending daily reminders to keep you on track.

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ 
- Azure Functions Core Tools v4
- Azurite (for local development)

### Local Development Setup

1. **Clone and Setup**
```bash
git clone <repository-url>
cd daily-spark
```

2. **Backend Setup**
```bash
cd daily-spark-function
dotnet restore
# Configure local.settings.json with your Cosmos DB credentials
func start
```

3. **Frontend Setup**
```bash
cd daily-spark-ui
npm install
npm start
```

4. **Start Azurite** (in separate terminal)
```bash
mkdir azuriteFolder
azurite --location ./azuriteFolder --debug ./azuriteFolder/debug.log
```

## 🏗️ Architecture Overview

Daily Spark is built with a modern, scalable architecture:

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Azure Functions (.NET 8) + Durable Functions
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage
- **Authentication**: Custom token-based system

### Key Features
- ✅ User authentication and management
- ✅ Curriculum creation and management
- ✅ Daily email notifications
- ✅ Progress tracking
- ✅ Responsive web interface
- ✅ Scalable serverless architecture

## 📚 Documentation

For detailed documentation, implementation guides, and technical references, see the **[Documentation Hub](docs/README.md)**.

### Quick Navigation
- **[Architecture Overview](docs/architecture/README.md)** - System design and patterns
- **[Environment Setup](docs/frontend/ENVIRONMENT_SETUP.md)** - Development environment
- **[API Integration](docs/frontend/API_INTEGRATION_PLAN.md)** - Frontend-backend integration
- **[Testing Guide](docs/testing/README.md)** - Testing strategy and procedures
- **[Security](docs/frontend/SECURITY_IMPROVEMENTS.md)** - Security considerations

## 🔧 Configuration

### Environment Variables

#### Backend (`daily-spark-function/local.settings.json`)
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "COSMOS_DB_ACCOUNT_ENDPOINT": "https://your-cosmos-account.documents.azure.com:443/",
    "COSMOS_DB_API_KEY": "<your-cosmos-db-api-key>",
    "COSMOS_DB_DATABASE_ID": "daily-spark",
    "COSMOS_DB_USER_CONTAINER_ID": "users",
    "COSMOS_DB_CURRICULUM_CONTAINER_ID": "curricula"
  }
}
```

#### Frontend (`daily-spark-ui/.env.local`)
```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:7071/api
REACT_APP_API_TIMEOUT=10000
REACT_APP_API_RETRY_ATTEMPTS=3
REACT_APP_API_RETRY_DELAY=1000

# Environment
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_LOGGING=true

# Security (for local development only)
REACT_APP_STORAGE_KEY=your-secure-encryption-key-here
```

> **Note**: Create the `.env.local` file in the `daily-spark-ui` directory. This file is gitignored for security reasons.

## 🧪 Testing

### Backend Tests
```bash
cd daily-spark-function
dotnet test
```

### Frontend Tests
```bash
cd daily-spark-ui
npm test
```

### Manual Testing
```bash
# Test API endpoints
curl -X POST http://localhost:7071/api/StartProcessAllUsersClient
curl "http://localhost:7071/api/QueryCurriculumTopicsByUserId?userId=test-user"
```

## 🚀 Deployment

### Backend Deployment
```bash
cd daily-spark-function
func azure functionapp publish <your-function-app-name>
```

### Frontend Deployment
```bash
cd daily-spark-ui
npm run build
# Deploy build folder to your hosting service
```

### Deploying Azure Functions via CLI

Follow these steps to publish and deploy your Azure Functions app:

1. **Publish the function app:**
   ```zsh
   dotnet publish -c Release
   ```

2. **Navigate to the publish output directory:**
   ```zsh
   cd daily-spark-function/bin/Release/net8.0/publish
   ```

3. **Zip the contents of the publish folder (not the folder itself):**
   ```zsh
   zip -r ../daily-spark-functions.zip .
   ```

4. **Deploy the zip to Azure using the CLI:**
   Replace `<function-app-name>` and `<resource-group>` with your Azure Function App name and resource group.
   ```zsh
   az functionapp deployment source config-zip \
     --name <function-app-name> \
     --resource-group <resource-group> \
     --src ../daily-spark-functions.zip
   ```

This will deploy your Azure Functions app using the zipped publish output.

For detailed deployment instructions, see **[MVP Release Guide](docs/deployment/MVPForRelease.md)**.

## 🔒 Security Considerations

- **Authentication**: Token-based authentication with expiration
- **Data Protection**: All data encrypted at rest and in transit
- **Input Validation**: Comprehensive client and server-side validation
- **CORS**: Properly configured for production domains
- **HTTPS**: Enforced in production environments

For detailed security information, see **[Security Improvements](docs/frontend/SECURITY_IMPROVEMENTS.md)**.

## 📊 Performance

- **Response Time**: <2 seconds for API calls
- **Function Execution**: <30 seconds for orchestrations
- **Database Queries**: <1 second for standard operations
- **Scalability**: Auto-scaling with Azure Functions Consumption plan

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Documentation Hub](docs/README.md)
- **Issues**: Create an issue in the repository
- **Testing**: [Testing Guide](docs/testing/README.md)

## 🔗 Related Resources

- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Daily Spark** - Empowering your learning journey, one day at a time. ✨