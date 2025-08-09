Migration Plan for Durable Functions (with Azure Storage)
1. Provision Azure Storage Account
Create an Azure Storage Account in the Azure Portal.
Copy the connection string for the storage account.
2. Update Local and Cloud Configuration
Add the storage connection string to your local.settings.json:
In Azure, set the same value in your Function App’s configuration under AzureWebJobsStorage.
3. Add Durable Functions NuGet Package
Install the Durable Functions extension:
4. Extract Logic for Activity Function
Move the main logic from QueryCurriculumTopicsByUserId into the new file ProcessUserCurriculumTopicsActivity.cs (already created).
5. Create Orchestrator Function
Add a new file (e.g., ProcessAllUsersOrchestrator.cs).
This function will:
Query Cosmos DB for user IDs.
Fan-out activity calls for each userId using CallActivityAsync.
6. Create Client Function
Add a new HTTP-triggered function to start the orchestrator.
7. Refactor Existing Function
Refactor QueryCurriculumTopicsByUserId to use the new activity logic if needed, or keep it as a standalone for single-user queries.
8. Test and Validate
Test the new durable workflow locally and in Azure.
Ensure the storage account is accessible and orchestration works.
Let me know if you want to proceed with any of these steps, such as NuGet installation, orchestrator scaffolding, or configuration file updates!### 4. Extract Logic for Activity Function

Move the main logic from QueryCurriculumTopicsByUserId into the new file ProcessUserCurriculumTopicsActivity.cs (already created).
5. Create Orchestrator Function
Add a new file (e.g., ProcessAllUsersOrchestrator.cs).
This function will:
Query Cosmos DB for user IDs.
Fan-out activity calls for each userId using CallActivityAsync.
6. Create Client Function
Add a new HTTP-triggered function to start the orchestrator.
7. Refactor Existing Function
Refactor QueryCurriculumTopicsByUserId to use the new activity logic if needed, or keep it as a standalone for single-user queries.
8. Test and Validate
Test the new durable workflow locally and in Azure.
Ensure the storage account is accessible and orchestration works.