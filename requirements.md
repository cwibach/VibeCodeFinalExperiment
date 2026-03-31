# FinalVibe Microblogging Web App Requirements

## 1. Functional Requirements

### 1.1 User Account & Authentication
- SHALL allow users to create a profile with username, display name, and optional bio/avatar.
- SHALL allow users to login to their profile.
- SHALL restrict posting, liking, and replying to authenticated users.
- SHOULD store passwords securely (hashed + salted).
- MAY provide "remember me" sessions.

### 1.2 Posting
- SHALL allow authenticated users to create short text posts.
- SHALL enforce a maximum length per post (e.g., 280 characters).
- MAY provide a live character counter in the compose UI.

### 1.3 Global Feed
- SHALL display a chronological feed of posts from all users (newest first).
- SHALL include posts from all users without following/follower filtering.
- SHOULD update feed content in near realtime or after explicit refresh action.
- MAY support pagination/infinite scroll.

### 1.4 Likes
- SHALL allow authenticated users to like and unlike posts.
- SHALL display like counts for posts.
- SHOULD prevent multiple likes from the same user on the same post.

### 1.5 Replies
- SHALL allow authenticated users to reply to posts.
- SHALL support one-level reply nesting (replies to posts, no multi-level threads).
- SHOULD display replies in context with their parent post.

### 1.6 Profiles
- SHALL allow viewing any user’s profile and their posts.
- SHALL display profile metadata: username, display name, bio, join date, post count, likes received.
- MAY include bio/avatar editing and other profile enhancements.

## 2. Non-Functional Requirements

### 2.1 Security
- SHALL require authentication for all post, like, and reply operations.
- SHOULD validate and sanitize user input to prevent XSS and injection.
- SHOULD use HTTPS in production.

### 2.2 Performance
- SHALL use feed pagination or lazy loading to avoid loading all posts at once.
- SHOULD keep standard UI responses under 500ms for common interactions.

### 2.3 Reliability
- SHOULD handle missing or deleted content gracefully.
- MAY retry transient backend errors for better UX.

## 3. Constraints (Hard Requirements)
- SHALL NOT implement private messaging.
- SHALL NOT implement retweets/reposts.
- SHALL NOT implement a follower/following graph.
- SHALL provide global feed only (no personalized timeline).

## 4. Optional Enhancements
- MAY support hashtags and search.
- MAY support user avatars and image attachments.
- MAY support post edit/delete for owners.
- MAY add notification support for likes/replies (not private messages).
- MAY improve accessibility (ARIA roles, keyboard navigation, contrast, etc.).

## 5. Acceptance Criteria
- GIVEN a visitor creating an account, WHEN they submit valid fields, THEN profile is created.
- GIVEN an authenticated user, WHEN they post under max length, THEN it appears in global feed.
- GIVEN any user, WHEN they open feed, THEN they see all posts sorted newest-first.
- GIVEN an authenticated user, WHEN they like/reply, THEN post metadata and UI update.
- GIVEN a profile link, WHEN opened, THEN profile metadata and posts display.

## 6. Glossary
- Post: short text status update with enforced max length.
- Global feed: feed that aggregates all users’ posts without follow filtering.
- Reply: single-level comment on a post.
- Profile: user identity with associated posts and metadata.
