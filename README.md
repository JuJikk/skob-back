# Plast Backend

This is the backend for the **Plast-Proba** application, designed to help Foremen (Vykhovnyks) manage Scouts' progress through various tasks and achievements (Probas) within their groups. It provides a RESTful API for managing Scouts, groups, probas, and related data.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Technologies](#technologies)
- [Development](#development)
- [Deployment](#deployment)
- [License](#license)

## Getting Started

### Prerequisites

- **Node.js** (v18.x or higher)
- **pnpm** (or npm)
- **MongoDB** (for database)

### Installation

Clone the repository:

```bash
git clone https://github.com/JuJikk/skob-back.git
```

Navigate into the project directory:

```bash
cd plast-backend
```

Install dependencies:

```bash
pnpm install
```

Set up environment variables (see Environment Variables).

Run the development server:

```bash
pnpm run start:dev
```

## Environment Variables

You need to configure the following environment variables. Create a .env file in the root directory and set the variables like this:

```bash
BACKEND_URL=http://localhost:3000
PORT=3000

MONGO_DB_NAME=your_db_name
MONGO_DB_URL=mongodb://localhost:27017/plast
MONGO_DB_SSL=true

JWT_SECRET=your_jwt_secret

GOOGLE_AUTH_CLIENT_ID=your_google_client_id
GOOGLE_AUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_AUTH_CALLBACK_URL=your_google_callback_url

COOKIES_SECRET=your_cookies_secret

FRONTEND_BASE_URL=http://localhost:5173

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_VERIFIED_SENDER_EMAIL=your_sendgrid_sender_email
```

## API Documentation

Key Features
User Authentication: Secure login using Google OAuth.
Group Management: Create, update, and delete groups.
Scout Management: Add, update, and manage Scouts and their Probas.
Proba Progress: Track Scout progress in Probas with completion status.

## Technologies

NestJS, MongoDB, TypeScript, Google OAuth, SendGrid

## Development
Running in Development Mode
Use the following command to run the backend in watch mode (automatically restarts on file changes):

```bash
pnpm run start:dev
```

You can also use Docker 🐳 for deployment. Build and run the Docker container as follows:

Build the Docker image:

```bash
docker build . -t skob-backend 
```
Run the Docker container:

```bash
docker run -d -p 3000:3000 --env-file .env plast-backend
```

## License
This project is licensed under the MIT License.

Feel free to adjust project-specific details like repository links, deployment steps, or environment variables.

