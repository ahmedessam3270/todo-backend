# Project Documentation

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Running the Server](#running-the-server)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)

## Environment Setup

Create a `.env.dev` file in the root directory of your project with the following variables:

MONGODB_URI=mongodb://mongo:27017/your_database_name
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_ACCESS_TOKEN_EXPIRATION_MS=3600000
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000
SELENIUM_GRID_URL=http://selenium:4444/wd/hub
LINKEDIN_EMAIL=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password

## Running the Server
To run the server using Docker Compose:

Ensure Docker and Docker Compose are installed on your system.
Navigate to the project root directory in your terminal.
Run the following command:
docker-compose up --build

## API Endpoints
Users

- POST /users: Create a new user

Todo (Protected Routes)

- POST /todo: Add a new todo
- GET /todo: Get all todos for the current user
- GET /todo/:id: Get a specific todo by ID
- GET /todo/category/:cat: Get todos by category
- PATCH /todo/:id: Update a todo
- DELETE /todo/:id: Delete a todo

## Authentication
The application uses JWT for authentication. Access and refresh tokens are stored in HTTP-only cookies.
### Login
When a user logs in successfully, the server will:

- Generate an access token and a refresh token
- Store the hashed refresh token in the user's database record
- Set both tokens cookies in the response

### Logout
On logout, the server will:

- Clear the refresh token from the user's database record
- Clear both the access token and refresh token from the client

### Token Verification

- Access tokens are verified using the JWT_ACCESS_TOKEN_SECRET
- Refresh tokens are verified using the JWT_REFRESH_TOKEN_SECRET and compared against the hashed token stored in the user's database record

## Additional Notes

The project uses the NestJS framework
MongoDB is used for data storage
Selenium for web scraping tasks
