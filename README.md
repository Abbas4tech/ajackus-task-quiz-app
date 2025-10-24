# Ajackus Quiz App - Built with Next.js, MongoDB, and NextAuth

## Overview

This repository contains a full-stack Quiz Application built with Next.js (App Router), MongoDB, and NextAuth for authentication. It features:

- **Google OAuth Authentication** via NextAuth
- **Role-based access control** (admin and user roles)
- **Admin panel** for managing quizzes (create, update, delete)
- **Public-facing quiz interface** for users to take quizzes
- **MongoDB** as the database using Mongoose ODM
- UI built with **shadcn** component library for a clean, modern admin experience

***

## Features

### Authentication

- NextAuth integration using **Google provider**
- Sessions include user role (`user` or `admin`) for role-based access control
- Middleware restricts admin pages to users with admin role only


### Quiz Management

- Admin panel with sidebar showing all quizzes
- Admins can **create** and **edit** quizzes with multiple MCQ questions
- Quiz questions accept multiple options with radio-button selection for the correct answer
- Form validation with **Zod** schemas for strong type safety and error handling
- Create and update operations handled via **reusable React forms** using shadcn UI components


### Database \& API

- MongoDB schema closely models the quiz data with question subdocuments
- API routes built with Next.js app router and server actions:
    - Fetch all quizzes with pagination
    - Fetch quiz by ID
    - Add, update, delete quiz operations (admin only)
- Uses server components and server actions for efficient, secure data handling


### UI \& User Experience

- Admin panel UI built with **shadcn UI** components (sidebar, forms, cards, radio groups)
- Responsive and accessible design
- Visual feedback like loading states and toast notifications
- Public routes allow users to access quizzes without authentication

***

## Technologies Used

- Next.js 14+ (App Router)
- NextAuth.js (Google OAuth)
- MongoDB \& Mongoose
- React Hook Form with Zod validation
- shadcn UI components
- TypeScript for type safety
- TailwindCSS for styling

***

## Setup Instructions

1. **Clone the repo**
```bash
git clone https://github.com/yourusername/quiz-app.git
cd quiz-app
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Environment Variables**

Create `.env.local` with:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=generate_a_secure_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```


***

## Folder Structure

- `/app` - Next.js app router pages and layouts
- `/app/api` - API routes for quizzes and auth
- `/components` - Reusable UI components (forms, sidebar, buttons)
- `/lib` - Utilities like db connection, auth options
- `/models` - Mongoose models (Quiz, User)
- `/schemas` - Zod validation schemas for quiz forms

***

## Role-Based Access

- Admin users can access `/admin` routes to manage quizzes
- Middleware verifies session role for protected routes
- Regular users can access public quiz routes without login

***

## Contributing

Contributions are welcome! Please open issues or pull requests for new features or bug fixes.

***

## License

This project is licensed under the MIT License.

***



