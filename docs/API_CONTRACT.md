# Adesua API contract

Changing anything here needs agreement from all three members. Update this file in the same pull request as the change.

Base URL: `/api` (locally `http://localhost:5000/api`). Private routes need the header `Authorization: Bearer <token>`.

## Response shape

- Success: `{ "success": true, "message": "Course created successfully", "data": { ... } }`
- Lists: `data` is `{ "items": [ ... ], "pagination": { "page": 1, "limit": 9, "total": 27, "totalPages": 3 } }`
- Error: `{ "success": false, "message": "Course not found", "data": null }`
- Validation error (400): the error shape plus `"errors": [ { "field": "email", "message": "Enter a valid email address." } ]`

## Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | created |
| 400 | validation failed, invalid ID, or a broken business rule |
| 401 | not logged in, bad token, or wrong login details |
| 403 | wrong role, not the owner, not enrolled, or deactivated |
| 404 | not found |
| 409 | duplicate |
| 413 | request body over 100kb: "The request body is too large." |
| 429 | too many sign-up or login attempts (20 per 15 minutes per IP): "Too many attempts. Please try again in 15 minutes." |
| 500 | unexpected error |

## Endpoints

| Method | Path | Access | Purpose | Owner | Route file |
|---|---|---|---|---|---|
| GET | `/api/health` | Public | API is running | A | `health.routes.js` |
| POST | `/api/auth/register` | Public | Create a student or instructor account | A | `auth.routes.js` |
| POST | `/api/auth/login` | Public | Log in | A | `auth.routes.js` |
| GET | `/api/auth/me` | Logged in | Current user | A | `auth.routes.js` |
| GET | `/api/categories` | Public | Categories with published-course counts | A | `categories.routes.js` |
| POST | `/api/categories` | Admin | Create a category | A | `categories.routes.js` |
| PATCH | `/api/categories/:id` | Admin | Rename a category | A | `categories.routes.js` |
| DELETE | `/api/categories/:id` | Admin | Delete an unused category | A | `categories.routes.js` |
| GET | `/api/admin/stats` | Admin | Platform totals | A | `admin.routes.js` |
| GET | `/api/admin/users` | Admin | Users with search, role filter, pagination | A | `admin.routes.js` |
| PATCH | `/api/admin/users/:id/status` | Admin | Deactivate or reactivate `{ isActive }` | A | `admin.routes.js` |
| GET | `/api/admin/courses` | Admin | All courses including drafts | A | `admin.routes.js` |
| GET | `/api/courses` | Public | Published courses with search, filters, sort, pagination | B | `courses.routes.js` |
| GET | `/api/courses/:id` | Public | One published course with lesson outline | B | `courses.routes.js` |
| POST | `/api/courses` | Instructor | Create a course (starts as a draft) | B | `courses.routes.js` |
| PATCH | `/api/courses/:id` | Owner or admin | Update course details | B | `courses.routes.js` |
| PATCH | `/api/courses/:id/status` | Owner or admin | Publish or unpublish `{ status }` | B | `courses.routes.js` |
| DELETE | `/api/courses/:id` | Owner or admin | Delete a course with no students, and its lessons | B | `courses.routes.js` |
| POST | `/api/courses/:id/lessons` | Owner | Add a lesson | B | `courses.routes.js` |
| PATCH | `/api/lessons/:id` | Owner | Edit a lesson | B | `lessons.routes.js` |
| DELETE | `/api/lessons/:id` | Owner | Delete a lesson | B | `lessons.routes.js` |
| GET | `/api/instructor/courses` | Instructor | My courses, any status | B | `instructorCourses.routes.js` |
| GET | `/api/instructor/courses/:id` | Instructor (owner) | My course with full lessons, for the edit page | B | `instructorCourses.routes.js` |
| GET | `/api/courses/:id/lessons` | Enrolled student, owner, admin | Full lessons plus my progress | C | `learning.routes.js` |
| POST | `/api/enrollments` | Student | Enroll in a free course `{ courseId }` | C | `enrollments.routes.js` |
| GET | `/api/enrollments/my` | Student | My courses with progress | C | `enrollments.routes.js` |
| PATCH | `/api/enrollments/:courseId/lessons/:lessonId/complete` | Enrolled student | Mark a lesson complete | C | `enrollments.routes.js` |
| POST | `/api/orders` | Student | Start checkout `{ courseId, paymentMethod }` | C | `orders.routes.js` |
| POST | `/api/orders/:id/pay` | Order owner | Demo payment: mark paid and enroll | C | `orders.routes.js` |
| GET | `/api/orders/my` | Student | Purchase history | C | `orders.routes.js` |
| GET | `/api/instructor/stats` | Instructor | Students and earnings | C | `instructorStats.routes.js` |

## Query parameters

- `GET /api/courses` (published courses only):
  - `search`: matches the title, ignoring case
  - `category`: category slug
  - `level`
  - `price`: `free` or `paid`
  - `sort`: `newest`, `popular`, `price_asc` or `price_desc` (default `newest`)
  - `page`: default 1
  - `limit`: default 9, max 50
- `GET /api/admin/users`: `search` (name or email), `role`, `page`, `limit` (default 10)
- `GET /api/admin/courses`: `search` (title), `status`, `page`, `limit` (default 10)

## What key endpoints return in "data"

- register, login: `{ token, user }`. The user never includes the password.
- `GET /api/auth/me`: `{ user }`
- `GET /api/categories`: `[ { _id, name, slug, courseCount } ]`, where `courseCount` counts published courses
- `GET /api/courses`, each item: `{ _id, title, shortDescription, price, level, thumbnailUrl, lessonCount, totalMinutes, studentCount, createdAt, category: { _id, name, slug }, instructor: { _id, name } }`
- `GET /api/courses/:id`: every course field, plus:
  - `instructor { _id, name, bio }`
  - `category`
  - `lessons: [ { _id, title, durationMinutes, order, isPreview } ]`, sorted by `order`. `videoUrl` and `content` are included only when `isPreview` is true.
- `GET /api/instructor/courses`: my courses in any status, newest first
- `GET /api/instructor/courses/:id`: the course with full lessons
- `GET /api/courses/:id/lessons`: `{ course: { _id, title, lessonCount }, lessons: [ full lessons ], enrollment: { completedLessons, progress } }`. `enrollment` is `null` for the owner or an admin.
- `PATCH /api/enrollments/:courseId/lessons/:lessonId/complete`: `{ completedLessons, progress, completedAt }`
- `POST /api/enrollments`: the new enrollment (201)
- `GET /api/enrollments/my`: `[ { _id, progress, completedAt, createdAt, course: { _id, title, thumbnailUrl, lessonCount, category, instructor: { name } } } ]`
- `POST /api/orders`: the order with status `"pending"` (201)
- `POST /api/orders/:id/pay`: `{ order, enrollment }`
- `GET /api/orders/my`: orders, newest first, each with `course { _id, title }`
- `GET /api/instructor/stats`: `{ totalStudents, totalEarnings, publishedCount, draftCount, courses: [ { courseId, title, studentCount, earnings } ] }`
- `GET /api/admin/stats`: `{ users, publishedCourses, enrollments, totalPayments }`

## Validation messages

| Field or case | Message |
|---|---|
| name | Name must be between 2 and 50 characters. |
| email | Enter a valid email address. |
| password | Password must be at least 8 characters and include a letter and a number. |
| login password (empty) | Enter your password. |
| role | Choose to learn or to teach. |
| category name | Category name must be between 2 and 40 characters. |
| category name with no letter or number | Category name must include a letter or a number. |
| course title | Title must be between 5 and 120 characters. |
| shortDescription | Keep the short description under 160 characters. |
| description | Description must be at least 20 characters. |
| price below 0 | Price can't be negative. Enter 0 for a free course. |
| price above 5000 | Price can't be more than 5,000. |
| level | Choose a level. |
| category | Choose a valid category. |
| thumbnailUrl | Enter a full link starting with https://. |
| lesson title | Lesson title must be between 3 and 120 characters. |
| videoUrl | Use a YouTube link. |
| lesson with no video and no notes | Add a YouTube link, lesson notes, or both. |
| durationMinutes | Enter the length in minutes (1 to 300). |
| paymentMethod | Choose a payment method. |
| status | Status must be draft or published. |
| isActive | isActive must be true or false. |
| any `:id` | Invalid ID |
| page and limit | Page and limit must be positive numbers. |
| request body that isn't valid JSON (400) | The request body isn't valid JSON. |

## Business rules (with their exact messages)

- Public lists and details show only published courses. Asking for a draft returns 404 "Course not found".
- Only students can enroll or buy (403).
- Enrolling twice returns 409 "You're already enrolled in this course."
- Free courses use `POST /api/enrollments`; paid courses use orders. Using the wrong one returns 400 "This course is paid. Go to checkout." or "This course is free. Enroll directly."
- The order amount always comes from the course price, never from the request.
- Paying an order:
  - The order must belong to the user and still be pending. Otherwise 400 "This order has already been paid."
  - Set it to paid with `paidAt`, create the enrollment linked to the order, and add 1 to the course's `studentCount`.
- Free enrollment also adds 1 to `studentCount`.
- Full lesson content goes only to enrolled students, the course owner and admins. Anyone else gets 403 "Enroll in this course to watch its lessons."
- Marking a lesson complete:
  - The lesson must belong to the course.
  - Add it with `$addToSet`.
  - Set `progress = round(completed / lessonCount × 100)`.
  - Set `completedAt` when progress reaches 100.
- Publishing needs at least one lesson: 400 "Add at least one lesson before publishing."
- A course with students can't be deleted: 400 "This course has students. Unpublish it instead." Deleting a course also deletes its lessons.
- Creating, editing or deleting a lesson updates the course's `lessonCount` and `totalMinutes`.
- Instructors can change only their own courses and lessons (403).
- Category names are unique, ignoring capital letters ("design" clashes with "Design"): 409 "A category with this name already exists."
- An unknown category returns 404 "Category not found".
- A category used by any course can't be deleted: 400 "This category has courses. Move them to another category first."
- Admins can't deactivate themselves: 400 "You can't deactivate your own account."
- Deactivated users get 403 at login and on every request.
- Sign-up can never create an admin.
