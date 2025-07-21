# Daily Spark
> Your Partner in Daily Learning

`Daily Spark` is a personal learning assistant that helps you stay consistent and achieve your goals by:

Creating structured learning curricula for any problem or project you want to solve

Sending daily reminders with your learning topics to keep you on track

Tracking your progress and celebrating your milestones along the way

### ✨ Key Features
- Create a learning curriculum by providing a problem statement and desired learning time frame
- Receive daily reminder emails with structured topics to learn
- Confirm your knowledge with topic questions or exercises
- Track your progress as you complete topics and modules
- Celebrate achievements to keep motivation high

### Steps to use the project
1. Generate a desire curriculum through ChatGPT
  Using the following prompt to generate a JSON-formatted curriculum
  ```
  I have a problem or project I want to solve:

  Problem Statement: [Your project or problem you want to solve]
  Time Range: [How long do you want to take to complete this?]
  Daily Commitment: [How much time do you want to spend on this each day?]
  
  You are a Learning Partner AI. Your task is to help me create a curriculum that will guide me to complete this project or solve this problem. Structure the learning plan in a clean JSON format. Each topic should include:
  
  - title (string)
  - description (string)
  - estimatedTime (number of seconds)
  - question (a question or exercise to confirm my knowledge, string)
  - resources (an array of any relevant resources)
  
  Return only JSON in the following format:
  
  {
    "courseTitle": "",
    "topics": [
        {
          "title": "",
          "description": "",
          "estimatedTime": 0,
          "question": "",
          "resources": []
        }
      ]
  }
  ```
   
3. Use the app and receive a daily reminder

### Database Schema
2 main containers: users and curricula

#### 🗂 Container: users

**Partition Key:** `/PartitionKey` using the userId

Stores curricula per user.

Example Document:

```json
{
    "id": "user-uuid",
    "PartitionKey": "user-uuid",
    "email": "user-email@gmail.com",
    "displayName": "User Name",
}
```

#### 🗂 Container: curricula

**Partition Key:** `/PartitionKey` using the userId

Stores curricula per user.

Example Document:

```json
{
  "id": "curriculum-uuid",
  "userId": "user-uuid",
  "PartitionKey": "user-uuid"
  "courseTitle": "System Design Basics",
  "nextReminderDate": "2025-07-21T07:00:00Z",
  "topics": [
      {
        "id": "topic-uuid",
        "title": "What is System Design?",
        "description": "An overview of system design concepts.",
        "estimatedTime": 600,
        "question": "Explain the difference between high-level and low-level design.",
        "resources": ["https://example.com/system-design-intro"]
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
