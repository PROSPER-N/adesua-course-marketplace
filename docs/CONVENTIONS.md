# How we work on Adesua

These are the rules the three of us follow. Read this together with [API_CONTRACT.md](API_CONTRACT.md), which lists every endpoint, response and message.

## Who owns what

### Backend

| Member | Endpoints | Route files | Other files |
|---|---|---|---|
| A (lead) | health, auth, categories, admin | `health`, `auth`, `categories`, `admin` | `User` and `Category` models, `seed/data/users.js`, `seed/data/categories.js` |
| B | courses, lessons, instructor courses | `courses`, `lessons`, `instructorCourses` | `Course` and `Lesson` models, `seed/data/courses.js` |
| C | lesson player, enrollments, orders, instructor stats | `learning`, `enrollments`, `orders`, `instructorStats` | `Order` and `Enrollment` models, `seed/data/enrollments.js` |

Route files live in `backend/src/routes/` and are named `<name>.routes.js`. The top of each one lists its owner and endpoints.

### Frontend

| Member | Pages and components |
|---|---|
| A (lead) | Home, About, Admin, Not found |
| B | Courses, Course details, Instructor dashboard, Course form |
| C | Log in, Sign up, Checkout, My learning, Lesson player, EnrollButton, InstructorStats |

### Shared files: ask the lead before changing them

- Backend: `src/models/`, `src/utils/`, `src/middleware/`, `src/routes/index.js`, `src/app.js`
- Frontend: `src/api`, `src/utils`, `components/ui`, `components/layout`, `CourseCover`, `App.jsx`, `AuthContext`, the route guards
- Docs: changing `API_CONTRACT.md` needs all three of us to agree.

Never edit a file you don't own. Ask its owner instead.

## Git

- Name branches `feature/<short-name>`, for example `feature/course-search`. Never commit to `main`.
- One feature per branch. Pull `main` before you start:
  ```
  git switch main
  git pull
  git switch -c feature/<short-name>
  ```
- Keep pull requests small, so they're quick to review.
- Review rotation: A reviews B, B reviews C, C reviews A.
- Understand every line before you commit it. You must be able to explain your own code.
- Write commit messages in the present tense, like "Add course search and pagination".
- Make sure your commits are credited to your GitHub account (the school checks commit history). Set your identity for this repo once, using your noreply email from github.com/settings/emails:
  ```
  git config user.name "<your GitHub username>"
  git config user.email "<your id>+<your username>@users.noreply.github.com"
  ```

## Backend pattern

Each route runs these steps in this order. Leave out the ones a route doesn't need (a public route has no `protect` or `authorize`):

1. `validateObjectId` checks `:id` (or other named params) before any database call
2. `protect` makes sure the user is logged in and active, and sets `req.user`
3. `authorize` checks the role
4. the validator rules for the route (from `src/validators/`)
5. `validate` sends the 400 with field errors if a rule failed
6. the controller, wrapped in `asyncHandler`

```js
router.patch(
  "/:id",
  validateObjectId(),
  protect,
  authorize("instructor", "admin"),
  updateCourseRules,
  validate,
  updateCourse
);
```

- Controllers reply with `sendSuccess` and throw `AppError` for expected failures. `errorHandler` turns every error into the standard shape.
  ```js
  const getCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new AppError("Course not found", 404);
    sendSuccess(res, { message: "Course found", data: course });
  });
  ```
- Lists use `getPagination` and `buildPagination`:
  ```js
  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Course.countDocuments(filter),
  ]);
  sendSuccess(res, {
    message: "Courses found",
    data: { items, pagination: buildPagination(page, limit, total) },
  });
  ```
- User and instructor IDs always come from `req.user`, never from the request body. For example, `instructor: req.user._id`.
- Put `protect` and `authorize` on each route, not on `router.use()`. Two route files share `/api/courses` and two share `/api/instructor`, so a `router.use()` in one file would also run on the other file's routes.
- Every write route (POST, PATCH, DELETE) has validator rules plus `validate`.
- Never send a password back. The User model already removes it from responses.
- Tests: use `createUser()` and `tokenFor(user)` from `backend/tests/helpers.js`.

## Frontend pattern

- Pages call only the functions in `src/api`, never `fetch` or axios directly.
- Every page that loads data has three states:
  - loading: a skeleton or spinner
  - error: `ErrorMessage` with a retry button
  - empty: `EmptyState`
- Submit buttons use the `loading` prop, so people can't submit twice.
- Use `getErrorMessage` for error text and `getFieldErrors` for field errors.
- Reuse the components in `components/ui`. Use only the theme colours.
- Build mobile first, and check every page at 390px, 820px and 1280px.

## Databases

- We all share one MongoDB Atlas cluster, but each of us uses our own databases: `adesua_dev_<name>` and `adesua_test_<name>`.
- You choose the database by changing the name after the `/` in the connection string:
  ```
  MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/adesua_dev_<name>?retryWrites=true&w=majority
  MONGO_URI_TEST=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/adesua_test_<name>?retryWrites=true&w=majority
  ```
- Seeding only wipes your own database. It refuses to run on the default `test` database (the one you get when the name is missing).
- Tests refuse to run unless `MONGO_URI_TEST` is different from `MONGO_URI` and its database name contains "test".
- If you can't connect, check that your IP address is allowed in Atlas under Network Access.

## Packages

No new packages without asking the lead. Every install changes `package-lock.json` for everyone.

## Secrets

- Never commit `.env`. Only `.env.example` (with blank secrets) goes in git.
- Never paste secrets into group chats. That includes the database password and `JWT_SECRET`.
- Make your own `JWT_SECRET` with:
  ```
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

## Definition of done for a feature

- [ ] Works end to end, with backend validation
- [ ] Has loading, error and empty states
- [ ] Checked at 390px, 820px and 1280px
- [ ] Tested in Postman and saved to the collection
- [ ] Has at least one Jest test
- [ ] Pull request reviewed and merged

## Version gotchas

We use the newest versions of Express (5) and Mongoose (9). Many tutorials show older code that breaks here:

- **Mongoose 9 hooks don't get `next`.** Write `schema.pre("save", async function () { ... })` and use `return` to stop early. Code that calls `next()` fails.
- **`findByIdAndUpdate()` skips save hooks.** Hooks like the password hash and the category slug don't run. To change a user's password or a category's name, load the document, change it, then call `save()`.
- **Express 5 doesn't accept `"*"` as a route path.** Use `app.use(...)` for catch-all handlers (`notFound` already does this).
- **`req.query` is read-only in Express 5.** Sanitizers like `query("page").toInt()` don't change `req.query`, so `req.query.page` is still the text `"3"`. Use `matchedData(req)` from express-validator to get the cleaned values, or use `getPagination(req.query)`, which converts page and limit itself.
- **`req.body` is `undefined` when a request has no JSON body.** Before Express 5 it was `{}`. Validators handle this, so always put the validator rules and `validate` before the controller.
- **Express 5 already sends errors from async controllers to `errorHandler`.** We still wrap every controller in `asyncHandler` so they all look the same.
