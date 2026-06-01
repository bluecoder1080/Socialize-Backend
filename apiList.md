# Socialize Backend API List

Base URL: `http://localhost:3000`

## Auth

| Method | Endpoint  | Auth | Body / Params                                | Notes                                                     |
| ------ | --------- | ---- | -------------------------------------------- | --------------------------------------------------------- |
| POST   | `/signup` | No   | `FirstName`, `LastName`, `Email`, `Password` | Creates a new user after validation and password hashing. |
| POST   | `/signin` | No   | `Email`, `Password`                          | Sets the `token` cookie on success.                       |
| POST   | `/logout` | No   | None                                         | Clears the `token` cookie.                                |

## Profile

| Method | Endpoint                  | Auth | Body / Params                    | Notes                                               |
| ------ | ------------------------- | ---- | -------------------------------- | --------------------------------------------------- |
| GET    | `/profile`                | Yes  | None                             | Returns the logged-in user from the `token` cookie. |
| PATCH  | `/profile/edit`           | Yes  | Editable profile fields          | Updates profile data for the logged-in user.        |
| PATCH  | `/profile/forgetPassword` | Yes  | `currentPassword`, `newPassword` | Verifies current password before updating.          |

## Connection Requests

| Method | Endpoint                              | Auth | Body / Params                | Notes                                                               |
| ------ | ------------------------------------- | ---- | ---------------------------- | ------------------------------------------------------------------- |
| POST   | `/requests/:toUserId/send/:status`    | Yes  | `toUserId`, `status` in URL  | `status` must be `ignored` or `interested`.                         |
| POST   | `/requests/:requestId/review/:status` | Yes  | `requestId`, `status` in URL | `status` must be `accepted` or `rejected`.                          |
| GET    | `/user/requests/received`             | Yes  | None                         | Returns incoming connection requests with sender details populated. |
| GET    | `/user/connections`                   | Yes  | None                         | Returns accepted connections for the logged-in user.                |

## User / Feed / Utility

| Method | Endpoint    | Auth | Body / Params                        | Notes                                                                                |
| ------ | ----------- | ---- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| GET    | `/feed`     | No   | None                                 | Current implementation returns all users. This is the live feed API in `src/app.js`. |
| GET    | `/user`     | No   | `email` in request body              | Searches users by email.                                                             |
| GET    | `/fid`      | No   | `_idProvided` in request body        | Finds a user by Mongo id.                                                            |
| DELETE | `/user`     | No   | `id` in request body                 | Deletes a user by id.                                                                |
| PATCH  | `/user/:id` | No   | `photoUrl`, `About`, `Gender`, `Age` | Updates a user by id. Allowed fields are restricted.                                 |

## Notes

- Routes are mounted at `/` in `src/app.js`, so the paths above are the final paths.
- Auth-protected routes use the `token` cookie and the `Userauth` middleware.
- There is a commented protected feed stub in `src/Routes/user.js`, but it is not active.
- If you want a real social feed, the current `/feed` route should be replaced or filtered in backend logic.
