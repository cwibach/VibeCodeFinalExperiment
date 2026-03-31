# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Backend + Full Stack Startup (Express + MongoDB)

This project includes an Express API backend for login/register and a MongoDB user store.

1. Install server dependencies (if not already installed):
   - `npm install express mongoose bcrypt cors dotenv`
   - `npm install --save-dev concurrently`

2. Start MongoDB locally or configure [MongoDB Atlas](https://www.mongodb.com/atlas) and set `.env`:
   - `MONGODB_URI=mongodb://127.0.0.1:27017/vibetwitterlike`
   - `BACKEND_PORT=5001`
   - `PORT=3000` (React frontend)

3. Start backend API server (from project root):
   - `npm run start:server`

4. Verify backend health: `GET http://localhost:5001/api/ping` should return `{ status: "ok", message: "Backend healthy" }`

4. Start React development UI (from project root):
   - `npm start`

5. Or run both concurrently (if configured in package.json):
   - `npm run dev`

6. Login endpoint: `POST http://localhost:5001/api/login`
   - payload: `{ "username": "user1", "password": "password123" }`

7. Register endpoint: `POST http://localhost:5001/api/register`
   - payload: `{ "name": "Jane Doe", "username": "jane", "email": "jane@example.com", "password": "password123", "dob": "1990-01-01" }`

8. On successful login, the frontend logs `Login successful` in browser console.

### Notes

- API request proxy is configured through Create React App `proxy` setting in `package.json` so frontend can use `/api/*`.
- Add auth token/cookie session in a next iteration.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
