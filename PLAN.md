# Quiz App Development Plan

## Project Overview

A full-stack Quiz Application built with **Next.js 15 (App Router)**, **MongoDB**, **NextAuth**, and **shadcn UI**. The app features role-based access control with separate admin and public interfaces.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Quiz Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend Layer (Next.js Client Components)                │
│  ├── Admin Panel (Protected Routes)                        │
│  │   ├── Dashboard                                         │
│  │   ├── Quiz Creation/Editing                            │
│  │   └── Quiz Management                                  │
│  └── Public Routes                                         │
│      ├── Quiz Listing                                      │
│      └── Quiz Taking Interface                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Backend Layer (Next.js Server Components & Actions)      │
│  ├── Server Actions (Data Fetching)                       │
│  │   ├── getAllQuizzes()                                  │
│  │   ├── getQuizById()                                    |
│  │
│  └── API Routes                                            │
│      ├── /api/quiz (GET, POST)                            │
│      └── /api/quiz/[id] (GET, PUT, DELETE)               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication Layer (NextAuth)                          │
│  ├── Google OAuth Provider                                │
│  ├── User Sessions                                        │
│  └── Role-Based Access Control                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Database Layer (MongoDB + Mongoose)                      │
│  ├── User Model                                           │
│  ├── Quiz Model                                           │
│  └── Question Subdocuments                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Authentication & Authorization

### 1.1 User Schema

**Location:** `models/User.ts`

**Features:**

- Email-based unique identification
- Google OAuth integration with NextAuth
- Role-based access control with enum: `['user', 'admin']`
- Email verification support
- Profile image storage

**Fields:**

- `name`: String (user's display name)
- `email`: String (unique, required)
- `emailVerified`: Date (optional)
- `image`: String (profile picture URL)
- `role`: Enum ('user' | 'admin') - Default: 'user'

### 1.2 NextAuth Configuration

**Location:** `lib/auth.ts` (or `lib/auth/authOptions.ts`)

**Features:**

- Google OAuth authentication
- Session management
- Role information in JWT token
- Callback functions for profile updates

**Providers:**

- Google (OAuth 2.0)

**Callbacks:**

- `signIn()`: Verify user login
- `jwt()`: Add role to JWT token
- `session()`: Include role in session object

### 1.3 Middleware

**Location:** `middleware.ts`

**Purpose:**

- Protect admin routes (`/admin/*`)
- Check user role before allowing access
- Redirect non-admin users to public routes
- Handle authentication redirects

**Protected Routes:**

- `/admin/*` - Requires admin role
- `/admin/quiz/new` - Create quiz
- `/admin/quiz/[id]` - Edit quiz

---

## 2. Database Schema & Models

### 2.1 Quiz Model

**Location:** `models/Quiz.ts`

**Purpose:** Store quiz data with associated questions

**Schema Structure:**

```typescript
interface IQuestion {
  questionText: string; // Question content
  options: string[]; // 2-6 answer options
  correctAnswer: string; // Must be one of the options
}

interface Quiz {
  title: string; // Quiz title (max 100 chars)
  description?: string; // Optional description
  questions: IQuestion[]; // Array of 1-50 questions
  createdBy?: ObjectId; // Reference to admin user
  createdAt: Date; // Timestamp
  updatedAt: Date; // Timestamp
}
```

**Validation:**

- Title: Required, 3-100 characters, unique index
- Questions: 1-50 questions minimum
- Options: 2-6 options per question
- Correct Answer: Must match one of the options

**Indexes:**

- `{ title: 1 }` - For search queries
- `{ createdAt: -1 }` - For sorting by date
- `{ createdBy: 1 }` - For filtering admin's quizzes

**Subdocument:** Question schema uses `_id: false` to avoid nested IDs

---

## 3. Frontend Components & Pages

### 3.1 Admin Panel

#### 3.1.1 Admin Layout

**Location:** `app/(dashboard)/admin/layout.tsx`

**Features:**

- SidebarProvider wrapping all admin pages
- Server-side data fetching of all quizzes
- Sticky header with navigation trigger
- Responsive sidebar

**Data Flow:**

```
ServerComponent (layout.tsx)
  ↓
getAllQuizzes() [Server Action]
  ↓
AppSidebar [Client Component]
```

#### 3.1.2 AppSidebar Component

**Location:** `components/AppSidebar.tsx`

**Features:**

- Display all available quizzes in a list
- "Create New Quiz" button
- Quiz search/filter capability
- Active page highlighting
- Logout button
- Responsive collapsible design

**Sections:**

- **Navigation:** Dashboard, Create New Quiz links
- **Quiz List:** Scrollable list of all quizzes
- **Footer:** Logout button

#### 3.1.3 Quiz Form Component (Reusable)

**Location:** `components/quiz-form.tsx`

**Features:**

- Works in both "create" and "edit" modes
- Form validation with Zod schema
- React Hook Form integration with shadcn UI
- Dynamic question/option management
- Real-time preview of questions
- Submit to appropriate API endpoint based on mode

**Props:**

- `mode`: "create" | "edit"
- `quizId?`: Quiz ID (for edit mode)
- `initialData?`: Pre-filled form data (for edit mode)

**Form Structure:**

1. Quiz Title Input
2. Add Question Section
   - Question text input
   - Dynamic option inputs
   - Radio button for correct answer selection
   - Add/remove option functionality
3. Questions Preview
   - Display all added questions
   - Show correct answer indicator
   - Delete question button
4. Submit Button
   - Changes text based on mode
   - Shows loading state

#### 3.1.4 Admin Pages

**Dashboard:** `app/(dashboard)/admin/page.tsx`

- Overview statistics
- Quick actions
- Recent quizzes

**Create Quiz:** `app/(dashboard)/admin/quiz/new/page.tsx`

- Imports and renders QuizFormComponent in "create" mode

**Edit Quiz:** `app/(dashboard)/admin/quiz/[id]/page.tsx`

- Fetches quiz data using getQuizById()
- Converts Mongoose document to plain object using .lean()
- Renders QuizFormComponent in "edit" mode with initialData

---

## 4. Form Validation & Types

### 4.1 Zod Schemas

**Location:** `lib/schemas/quiz.ts`

```typescript
const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options are required")
    .max(6, "Maximum 6 options allowed"),
  correctAnswer: z.string().min(1, "Please select the correct answer"),
});

const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required").max(100, "Title too long"),
  description: z.string().optional(),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required")
    .max(50, "Maximum 50 questions allowed"),
});
```

### 4.2 TypeScript Types

```typescript
type Question = z.infer<typeof questionSchema>;
type QuizForm = z.infer<typeof quizSchema>;
type PlainQuiz = {
  _id: string;
  title: string;
  description?: string;
  questions?: Question[];
  createdAt: Date;
  updatedAt: Date;
};
```

---

## 5. Server Actions

### 5.1 Purpose

Server Actions enable:

- Type-safe data fetching
- Server-side data serialization (fixes Mongoose toJSON() issues)
- Automatic client-server boundary handling
- Simplified API communication

### 5.2 Implemented Actions

**Location:** `app/actions/quiz.ts`

#### getAllQuizzes(limit = 50, skip = 0)

- Fetches all quizzes with pagination
- Uses `.lean()` to return plain objects
- Returns PlainQuiz[]
- Used in admin layout for sidebar

#### getQuizById(id: string)

- Fetches single quiz by MongoDB ID
- Includes full question data
- Throws notFound() if quiz not found
- Returns PlainQuiz

#### createQuiz(data: QuizForm)

- Creates new quiz document
- Validates against Zod schema first
- Stores createdBy user ID
- Returns created quiz

#### updateQuiz(id: string, data: Partial<QuizForm>)

- Updates existing quiz
- Supports partial updates
- Runs Mongoose validators
- Returns updated quiz

#### deleteQuiz(id: string)

- Soft or hard delete quiz
- Checks authorization
- Returns success/error

#### getQuizCount()

- Returns total quiz count
- Used for pagination info

#### searchQuizzes(query: string, limit = 20)

- Case-insensitive search by title
- Used for quiz discovery

---

## 6. Error Handling & Data Serialization

### 6.1 Common Error: "Only plain objects can be passed to Client Components"

**Root Cause:**

- Mongoose documents have `toJSON()` method
- Next.js cannot serialize these to Client Components

**Solutions:**

1. **Use `.lean()`** (Recommended)

   ```typescript
   await Quiz.findById(id).lean();
   ```

   - Returns plain JavaScript objects
   - No Mongoose methods
   - Best performance

2. **Use `.toObject()`**

   ```typescript
   quiz.toObject();
   ```

   - Converts document to plain object
   - Slightly slower than .lean()

3. **Manual Conversion**
   ```typescript
   JSON.parse(JSON.stringify(quiz));
   ```
   - Works but slowest
   - Can lose some data types

**Applied Solution:**

- All server actions use `.lean()` for optimal performance
- Plain object types (`PlainQuiz`) defined for type safety

---

## 7. API Routes

### 7.1 Quiz Routes

**Location:** `app/api/quiz/route.ts` and `app/api/quiz/[id]/route.ts`

#### GET /api/quiz

- Fetch all quizzes with pagination
- Query params: page, limit
- Returns: { quizzes, pagination }

#### POST /api/quiz

- Create new quiz
- Auth required: admin role
- Body: QuizForm
- Returns: created quiz

#### GET /api/quiz/[id]

- Fetch single quiz
- Returns: full quiz object

#### PUT /api/quiz/[id]

- Update quiz
- Auth required: admin role
- Body: Partial<QuizForm>
- Returns: updated quiz

---

## 8. UI Components

### 8.1 shadcn Components Used

- **Form** - React Hook Form integration
- **Input** - Text inputs for quiz/question data
- **Button** - Action buttons (Create, Submit, Delete)
- **RadioGroup** - Select correct answer
- **Card** - Container for quiz sections
- **Sidebar** - Navigation for admin panel
- **Select** - Dropdown selections (if needed)
- **Badge** - Status indicators
- **Progress** - Visual progress tracking
- **Table** - Display quizzes in tabular format
- **ScrollArea** - Scrollable quiz list

### 8.2 Custom Components

- **QuizFormComponent** - Reusable create/edit form
- **AppSidebar** - Admin navigation sidebar
- **QuizCard** - Card display for quiz listing
- **QuizzesTable** - Table display for quizzes
- **QuizInterface** - Quiz taking interface

---

## 9. File Structure

```
project-root/
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── callback/
│   │           └── page.tsx
│   ├── (dashboard)/
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── quiz/
│   │           ├── new/
│   │           │   └── page.tsx
│   │           └── [id]/
│   │               └── page.tsx
│   |
│   ├── api/
│   │   └── quiz/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   └── layout.tsx
├── models/
│   ├── User.ts
│   └── Quiz.ts
├── lib/
│   ├── auth.ts
│   ├── dbConnect.ts
│   ├── schemas/
│   │   └── quiz.ts
│   └── utils.ts
├── components/
│   ├── AppSidebar.tsx
│   ├── quiz-form.tsx
│   ├── QuizCard.tsx
│   └── ui/
│       ├── form.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── radio-group.tsx
│       ├── card.tsx
│       ├── sidebar.tsx
│       └── ... [more shadcn components]
├── actions/
│   └── quiz.ts
├── middleware.ts
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 10. Data Flow Diagrams

### 10.1 Create Quiz Flow

```
Admin User
    ↓
QuizFormComponent (mode: "create")
    ↓
Form Submission (onSubmit)
    ↓
Zod Validation (quizSchema.safeParse)
    ↓
createQuiz() Server Action
    ↓
MongoDB Insert
    ↓
Success Toast Notification
    ↓
Router.push("/admin/quiz/[id]")
    ↓
Revalidate Cache
```

### 10.2 Edit Quiz Flow

```
Admin User clicks quiz in sidebar
    ↓
app/admin/quiz/[id]/page.tsx (Server Component)
    ↓
getQuizById(id) Server Action
    ↓
.lean() conversion (plain object)
    ↓
Pass to QuizFormComponent (mode: "edit", initialData)
    ↓
Form loads with pre-filled data
    ↓
User modifies and submits
    ↓
updateQuiz() Server Action
    ↓
MongoDB Update
    ↓
Success Notification & Navigation
```

### 10.3 Public Quiz Taking Flow

```
User visits /quizzes
    ↓
getAllQuizzes() Server Action
    ↓
Display QuizCard components
    ↓
User clicks "Start Quiz"
    ↓
Navigate to /quiz/[id]
    ↓
QuizInterface loads
    ↓
User answers questions
    ↓
Submit Quiz
    ↓
Calculate score
    ↓
Display results with review
```

---

## 11. Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/quiz-app

# NextAuth
NEXTAUTH_SECRET=generate_secure_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 12. Key Features Implemented

✅ **Authentication**

- Google OAuth with NextAuth
- Role-based access control (user/admin)
- Session management

✅ **Admin Panel**

- Sidebar with quiz listing
- Create new quiz
- Edit existing quiz
- Delete quiz
- Reusable form component

✅ **Quiz Management**

- MCQ-only questions
- Radio button correct answer selection
- Dynamic option management
- Question preview before submission

✅ **Data Persistence**

- MongoDB database
- Mongoose ODM
- Validated schemas
- Proper indexing

✅ **Form Validation**

- Zod schema validation
- React Hook Form integration
- Client-side validation
- Server-side validation

✅ **UI/UX**

- shadcn components
- Responsive design
- Loading states
- Error handling
- Toast notifications

---

## 13. Future Enhancements

- [ ] Public quiz taking interface (not implemented yet)
- [ ] Quiz results tracking and analytics
- [ ] User quiz history
- [ ] Quiz categories/tags
- [ ] Question types (add Text type questions)
- [ ] Quiz difficulty levels
- [ ] Bulk quiz import/export
- [ ] Admin analytics dashboard
- [ ] Quiz sharing/permissions
- [ ] Question bank management
- [ ] Automated quiz generation
- [ ] Mobile app version
- [ ] Real-time quiz sessions
- [ ] Leaderboards

---

## 14. Testing Checklist

- [ ] User can sign in with Google
- [ ] Signed-in user gets correct role
- [ ] Admin can access /admin routes
- [ ] Non-admin redirected from /admin routes
- [ ] Admin can create quiz
- [ ] Form validates required fields
- [ ] Quiz saves to database
- [ ] Quiz appears in sidebar after creation
- [ ] Admin can edit existing quiz
- [ ] Admin can delete quiz
- [ ] Deleted quiz removed from sidebar
- [ ] All quizzes loaded on public page
- [ ] User can take quiz without authentication
- [ ] Quiz submission calculates score
- [ ] Results show correct/incorrect answers

---

## 15. Deployment Considerations

- [ ] MongoDB Atlas setup for production
- [ ] NextAuth secret generation
- [ ] Google OAuth credentials setup
- [ ] Environment variables in hosting platform
- [ ] CORS configuration if needed
- [ ] Rate limiting for API routes
- [ ] Database backups
- [ ] Error monitoring (Sentry, LogRocket)
- [ ] Performance monitoring
- [ ] CDN for static assets
- [ ] SSL/TLS certificate

---

## Summary

This Quiz App demonstrates a complete full-stack application with:

- Secure authentication with role-based access
- Responsive admin interface with sidebar navigation
- Server-side form handling with validation
- MongoDB data persistence
- Type-safe development with TypeScript
- Modern UI with shadcn components
- Production-ready error handling

The architecture separates admin (protected) and public routes, ensuring proper security while maintaining excellent user experience for both administrators managing quizzes and users taking them.
