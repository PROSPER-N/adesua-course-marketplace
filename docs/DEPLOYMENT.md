# Deploying Adesua

The API runs on Render as a web service built from `backend/`. Its data lives in the `adesua_prod` database on our shared MongoDB Atlas cluster. The frontend runs on Vercel, built from `frontend/` (step 7).

Live API: https://adesua-api.onrender.com/api/health

Live site: added after the first Vercel deploy

The project lead sets this up and keeps the production secrets. Never put a real password, connection string or `JWT_SECRET` in this file, in git or in a group chat.

## 1. Create the production database user

Production gets its own database user, and that user can only use `adesua_prod`. If its password ever leaks, our dev and test databases stay out of reach.

1. In Atlas, open **Security > Database & Network Access**, then the **Database Users** tab.
2. Click **Add New Database User** and choose **Password**.
3. Enter a username, for example `adesua_prod_app`. Click **Autogenerate Secure Password** and keep the password somewhere safe, like a password manager.
4. Open **Specific Privileges** and add the role `readWrite` on the database `adesua_prod`. Leave the collection empty.
5. Remove the **Built-in Role** that Atlas picks by default. If it stays, this user can also change every dev and test database on the cluster.
6. Optional: turn on **Restrict Access to Specific Clusters/Federated Database Instances** and pick our cluster.
7. Click **Add User**.

The connection string has the same shape as our dev ones, with the new user and `adesua_prod` after the `/`:

```
mongodb+srv://<prod user>:<prod password>@<cluster>.mongodb.net/adesua_prod?retryWrites=true&w=majority
```

If the password has symbols like `@`, `:`, `/` or `#`, percent-encode them in the string (`@` becomes `%40`), or generate a new password without them.

## 2. Network access

Our cluster's IP Access List already allows `0.0.0.0/0`, because our home IP addresses change often. Anyone can reach the cluster, so each database user's password is what protects the data, and the production user can only reach `adesua_prod`.

If we ever remove `0.0.0.0/0`, add Render's outbound IP addresses to the IP Access List. On the service's page in Render, open **Connect > Outbound** and copy the Frankfurt ranges.

## 3. Create the Render web service

In Render, choose **New > Web Service**, connect the GitHub repo and use these settings:

| Setting | Value |
|---|---|
| Branch | `main` |
| Language | Node |
| Root directory | `backend` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Region | Frankfurt |
| Instance type | Free |
| Health check path | `/api/health` |
| Auto-Deploy | After CI Checks Pass |

The health check path is under **Advanced** when you create the service, and under **Settings > Health Checks** afterwards. Set **Auto-Deploy** in the service's **Settings**. With **After CI Checks Pass**, Render only deploys a new commit on `main` once our Tests workflow passes on it, so a broken merge never goes live.

## 4. Environment variables

Add these under **Environment**. Don't add `PORT`: Render sets it, and `server.js` listens on it.

| Variable | What goes in it |
|---|---|
| `MONGO_URI` | The production connection string from step 1 |
| `JWT_SECRET` | A new random secret, made with the command below. Never reuse a dev secret: anyone who has it could make login tokens that production accepts. |
| `JWT_EXPIRES_IN` | How long a login lasts: `7d` |
| `CLIENT_URL` | The frontend's address, exactly as the browser shows it. For now `http://localhost:5173`, so we can run the frontend on our computers against the live API. Always set it: without it, any website can call the API from the browser. |
| `NODE_ENV` | `production`. Express then trusts Render's proxy, so the login rate limit counts each user's real IP. `npm ci` also skips the dev-only packages. |
| `NODE_VERSION` | `24`, the Node version Render installs |

Make a secret with:

```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

When the first deploy finishes, open the service's address with `/api/health` at the end. It should show `"success": true` and `"message": "API is running"`.

## 5. Add the demo data

**`npm run seed:production -- --yes` deletes everything in the production database, then adds the demo data.** Only run it on purpose, and never once real people use the site.

1. In `backend/`, create a file called `.env.production` with one line:
   ```
   MONGO_URI=<the production connection string>
   ```
   Git ignores this file. Never commit it, and delete it when you're done.
2. Run the seed once without `--yes`:
   ```
   npm run seed:production
   ```
   It prints `Connected to database: adesua_prod` and stops without changing anything (npm then shows an error, because the script stopped on purpose). If it shows any other name, stop and check `.env.production`. Ignore its hint to run `npm run seed -- --yes`: that's the dev command.
3. Run it for real:
   ```
   npm run seed:production -- --yes
   ```
   It adds the 6 test accounts from the README and the 7 categories.

Why this reaches the production database: `node --env-file=.env.production` loads that file before the script starts. The script then reads `.env` too, but dotenv never replaces a variable that's already set. If `.env.production` is missing, Node stops with "not found" before connecting. If the file has no `MONGO_URI` line, the dev one from `.env` gets used instead, which is why step 2 checks the name first.

## 6. Check it

- Open https://adesua-api.onrender.com/api/health.
- In Postman, import `docs/postman/adesua-production.postman_environment.json`, choose **Adesua production** and run **Auth > Log in**. Requests that create, rename or delete a category, or deactivate a user, change the live data. Run step 5 again to reset it.

## 7. Frontend on Vercel

Vercel builds the frontend and serves it as static files. `frontend/vercel.json` sends every path to `index.html`, so refreshing a page like `/courses/123` or `/admin` opens the app instead of a 404.

1. In Vercel, choose **Add New > Project** and import the GitHub repo.
2. Use these settings:

   | Setting | Value |
   |---|---|
   | Root directory | `frontend` |
   | Framework preset | Vite |
   | Build command | `npm run build` |
   | Output directory | `dist` |

3. Under **Environment Variables**, add `VITE_API_URL` with the value `https://adesua-api.onrender.com/api`, for **Production**. Vite writes this value into the built files, so after changing it, redeploy.
4. Click **Deploy**. When it finishes, Vercel shows the site's address, for example `https://adesua.vercel.app`.
5. In Render, open the API's **Environment** page and set `CLIENT_URL` to that address, exactly as the browser shows it, with no slash at the end.
6. Save and deploy the API. A changed variable only reaches the service on the next deploy. You can also use **Manual Deploy > Deploy latest commit**.
7. Check what the API now sends:
   ```
   curl -i -H "Origin: https://adesua.vercel.app" https://adesua-api.onrender.com/api/health
   ```
   `Access-Control-Allow-Origin` should be exactly the Vercel address.

Vercel also makes a preview link, with a random name, for every branch and pull request. Those links get CORS errors, because the API allows only one address (`CLIENT_URL`), and `VITE_API_URL` is set for Production only. Use the main address.

## Known behaviour

- **The free instance sleeps.** After 15 minutes with no requests, Render stops it. The next request wakes it up, which can take up to a minute. After that it's fast again.
- Free instances get 750 hours a month per Render workspace. That's enough for one service running all month.
- The demo accounts, including the admin, use the password from the README. Anyone who reads it can log in and change the live data, so re-seed (step 5) before a demo.

## Troubleshooting

### "bad auth : authentication failed" in the Render logs

The username or password in `MONGO_URI` is wrong. Check the user on the **Database Users** tab in Atlas, reset its password if you need to, and update `MONGO_URI` in Render. If the password has symbols, percent-encode them (step 1).

### "Could not connect to MongoDB" with a timeout

Atlas isn't accepting connections from Render. Check that `0.0.0.0/0` is still in the IP Access List, or add Render's outbound IPs (step 2).

### "Missing MONGO_URI in backend/.env." (or JWT_SECRET)

On Render this means the variable is missing from the **Environment** page. The message says `backend/.env` because that's where the variables live on our computers.

### CORS errors in the browser console

For example "blocked by CORS policy" or "is not equal to the supplied origin". `CLIENT_URL` must match the frontend's address exactly: same `https://`, same domain, no path and no slash at the end. Redeploy after changing it, then check with the `curl` command in step 7.

### The health check fails or the deploy never finishes

- Read the **Logs** first. The server only starts listening after it connects to the database, so the database errors above also fail the health check.
- The path must be `/api/health`, including `/api`.
- The root directory must be `backend`, or npm can't find `package.json`.
- Don't set `PORT` yourself. The log line `Server running on http://localhost:10000` is normal on Render.
- If the health check hasn't passed after 15 minutes, Render cancels the deploy and keeps the previous version running.
