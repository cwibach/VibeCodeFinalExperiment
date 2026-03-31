# FinalVibe Ideas / Roadmap

## 1. Authentication UX improvements
- Add password strength meter with colors and hints (weak, fair, strong).
- Add "show password" toggle for both login and register.
- Add email verification workflow with code input.
- Add forgot password + reset password flow.
- Add OAuth login options (Google, GitHub, etc.).

## 2. Form Validation enhancements
- Add real-time field validation (email format, username rules, password complexity).
- Add debounced username availability check (existing users block).
- Add inline helper texts and validation summaries.

## 3. Navigation / App flow
- Add protected routes for dashboard/feed when logged in.
- Add 404 and network-error fallback pages.
- Add multi-step registration (profile details -> interests -> avatar).

## 4. Feed & Social features
- Add retweet/repost (future optional, design permitting).
- Add follow/unfollow and follower graph.
- Add hashtags, search, and trending topics.
- Add media attachments (image upload, GIFs).

## 5. Interaction & notifications
- Add in-app notification drawer for likes/replies.
- Add push notifications (if deployed as PWA/mobile).
- Add DM system (future extension when not constrained).

## 6. Performance & NFR
- Add optimistic UI updates for post/like/reply actions.
- Add client-side caching and pagination.
- Add accessibility audits (WCAG 2.1 compliance, aria tags).

## 7. Testing & Quality
- Add E2E tests for login/register flow (Cypress).
- Add unit tests for form validation and auth flows.
- Add API contract tests and schema validation (OpenAPI).

## 8. Dev utilities and stability
- Add `GET /api/ping` health-check endpoint and frontend connectivity status indicator.
- Add “server status” page showing backend + database connectivity.
- Add explicit error panel when port conflict occurs, with recommended resolution steps.
- Add startup script `npm run clean-start` that kills stale `node`/`mongod` instances and starts both frontend + backend safely.
