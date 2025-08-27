# What are the missing point to be release?

### Backend
1. Endpoint to return a total number currently in the system
2. Add a configuration that cap the total of users at 100 as a validation for CreateUser function. Return a 400 when the limit is met


### Frontend
1. On the sign up page: make the api call to display the counting number of users in the system. add an env as cap number for user sign up is 100
    - If the users count is already at 100, don't display sign up form, but details to guide them back to the login to use `first-user` id as login demo
    - If there's still allowed limit, display a message saying the number and prompt them to hurry for the spot
2. Fix the upload curriculum validation logic. It is a little too strict. The following json should be accepted. Validate such that topics length has at least 1 object is good enough
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
3. Change the logic to support first-user as ReadOnly. Put this id in the configuration file as testing. So this account can only sign in, querying for curriculum but not sending any POST or PUT request (cannot edit curricula nor create new one). This will be used for demo and try out purposes for viewers if the users cap is at 100