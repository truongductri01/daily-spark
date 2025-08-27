# Daily Spark Frontend

A React-based frontend for the Daily Spark learning platform.

## Features

### User Management
- **User Registration**: Create new profiles with email and display name
- **User Count Display**: Shows current number of registered users
- **User Limit Enforcement**: Prevents signup when 100-user limit is reached
- **Demo User Support**: Special read-only mode for demo accounts

### Curriculum Management
- **Curriculum Creation**: Upload and create learning curricula
- **Curriculum Editing**: Modify existing curricula and topics
- **Progress Tracking**: Monitor learning progress and completion status

## Environment Configuration

Copy `env.example` to `.env` and configure the following variables:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:7071/api

# User Limits
REACT_APP_MAX_USERS_LIMIT=100
REACT_APP_DEMO_USER_ID=first-user
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:7071/api` |
| `REACT_APP_MAX_USERS_LIMIT` | Maximum number of users allowed | `100` |
| `REACT_APP_DEMO_USER_ID` | Demo user ID for readonly access | `first-user` |

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## User Count System

The frontend integrates with the backend user counter system to:

- Display current user count on the signup page
- Show remaining slots available
- Prevent signup when limit is reached
- Provide clear messaging about limits

## Demo User Mode

When users sign in with the demo user ID (`first-user` by default):

- A demo banner is displayed indicating read-only mode
- Create/edit/delete actions are disabled
- Full read access to curricula is maintained
- Clear messaging about demo limitations

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
