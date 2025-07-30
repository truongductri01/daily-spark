# Daily Spark
> Your Partner in Daily Learning

`Daily Spark` is a personal learning assistant that helps you stay consistent and achieve your goals by:

- Creating structured learning curricula for any problem or project you want to solve
- Sending daily reminders with your learning topics to keep you on track
- Tracking your progress and celebrating your milestones along the way

### ✨ Key Features
- Create a learning curriculum by providing a problem statement and desired learning time frame
- Receive daily reminder emails with structured topics to learn
- Confirm your knowledge with topic questions or exercises
- Track your progress as you complete topics and modules
- Celebrate achievements to keep motivation high

### Project Structure
- `Model/Records.cs`: Contains C# record definitions for User, Currciculum, Topic, and enums TopicStatus, CurriculumStatus.
- `Contract/ReturnTopic.cs`: Contains the ReturnTopic record used for API responses.
- `QueryCurriculumTopicsByUserId.cs`: Main Azure Function logic for querying user and curriculum topics.
- `local.settings.json`: Local configuration for Azure Functions runtime and Cosmos DB connection.

### Record Definitions
#### User
- `id` (string): User ID (UUID)
- `PartitionKey` (string): Partition key, same as userId
- `email` (string): User email
- `displayName` (string): User display name

#### Currciculum
- `id` (string): Curriculum ID (UUID)
- `userId` (string): Associated user ID
- `PartitionKey` (string): Partition key, same as userId
- `courseTitle` (string): Title of the course
- `status` (string): Curriculum status (NotStarted, InProgress, Completed, Active)
- `nextReminderDate` (DateTime): ISO timestamp for next reminder
- `topics` (List<Topic>): List of topics in the curriculum

#### Topic
- `id` (string): Topic ID (UUID)
- `title` (string): Topic title
- `description` (string): Topic description
- `estimatedTime` (int): Estimated time in seconds
- `question` (string): Knowledge check question
- `resources` (List<string>): List of resource URLs
- `status` (string): Topic status (NotStarted, InProgress, Completed)

#### ReturnTopic (API Response)
- `courseTitle` (string): Title of the course
- `title` (string): Topic title
- `description` (string): Topic description
- `estimatedTime` (string): Human-readable duration (e.g., "10 minutes")
- `question` (string): Knowledge check question
- `resources` (List<string>): List of resource URLs
- `status` (string): Topic status (NotStarted, InProgress, Completed)

### Enums
- `TopicStatus`: NotStarted, InProgress, Completed (serialized as string)
- `CurriculumStatus`: NotStarted, InProgress, Completed, Active (serialized as string)

### How to Run Locally
1. **Set up local.settings.json**
   Ensure your `daily-spark-function/local.settings.json` contains:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "",
       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
       "CosmosDbAccountEndpoint": "https://daily-spark-cosmos.documents.azure.com:443/",
       "CosmosDbApiKey": "<your-cosmos-db-api-key>"
     }
   }
   ```
   Replace `<your-cosmos-db-api-key>` with your actual Cosmos DB API key.

2. **Start the Function App**
   In the `daily-spark-function` directory, run:
   ```sh
   func start
   ```
   or use Visual Studio to run the project.

3. **Test the API**
   Send a GET or POST request to:
   ```
   http://localhost:7071/api/QueryCurriculumTopicsByUserId?userId=<your-user-id>
   ```
   The response will be a list of ReturnTopic objects with all fields and enums serialized as strings.

### Database Schema
#### 🗂 Container: users
**Partition Key:** `/PartitionKey` using the userId

Example Document:
```json
{
    "id": "user-uuid",
    "PartitionKey": "user-uuid",
    "email": "user-email@gmail.com",
    "displayName": "User Name"
}
```

#### 🗂 Container: curricula
**Partition Key:** `/PartitionKey` using the userId

Example Document:
```json
{
  "id": "curriculum-uuid",
  "userId": "user-uuid",
  "PartitionKey": "user-uuid",
  "courseTitle": "System Design Basics",
  "status": "Active",
  "nextReminderDate": "2025-07-21T07:00:00Z",
  "topics": [
      {
        "id": "topic-uuid",
        "title": "What is System Design?",
        "description": "An overview of system design concepts.",
        "estimatedTime": 600,
        "question": "Explain the difference between high-level and low-level design.",
        "resources": ["https://example.com/system-design-intro"],
        "status": "NotStarted"
      }
    ]
}
```

---

| Field             | Type    | Description                                   | Required |
| ----------------- | ------- | --------------------------------------------- | -------- |
| id                | string  | Primary key (curriculumId)                   | Yes      |
| curriculumId      | string  | Unique curriculum identifier (UUID)          | Yes      |
| userId            | string  | Associated user ID                           | Yes      |
| courseTitle       | string  | Title of the course                          | Yes      |
| nextReminderDate  | string  | ISO timestamp for next reminder              | Yes      |
| topics            | array   | Topics within the curriculum                 | Yes      |

---

**Note:**
- All enum values (status fields) are serialized as strings in API responses.
- Secrets (API keys) should never be committed to source control. Your `.gitignore` already excludes `local.settings.json`.

---

## 📐 UI & Email Styling Reference
For details on the color palette, typography, card layout, and HTML structure used in Daily Spark's UI and emails, see the [Styling Design Doc](daily-spark-function/Testing/design.md).

---
