# Architecture Interview Q&A for Socialize Backend

Use this as a speaking script for system design rounds. Each answer is framed as: current state, design reasoning, tradeoffs, and production evolution.

## 1) Explain your architecture end-to-end as if I am a senior engineer.

### Strong answer

The current system is a modular monolith built with Express and MongoDB. HTTP requests enter route modules, go through auth/validation middleware, then execute business logic inside route handlers, and finally read/write Mongoose models.

Auth uses JWT stored in cookies. The auth middleware validates token, fetches user, and attaches identity context to the request. Domain persistence is split into two main collections: users and connectionrequests. Request lifecycle is represented by status transitions in ConnectionRequest (interested, ignored, accepted, rejected).

The architecture is optimized for MVP speed and simplicity: one deployable unit, minimal operational overhead, fast feature iteration. The primary technical debt is thin layering: route handlers currently contain business logic and data access, which increases coupling and reduces testability. Next evolution is to add service + repository layers, centralized error handling, and Redis-backed caching/rate-limits.

### Interview closing line

It is a pragmatic modular monolith with clear domain boundaries, ready to evolve toward stronger layering before considering service decomposition.

## 2) What is a modular monolith? How is it different from microservices?

### Strong answer

A modular monolith is one deployable application with internal module boundaries (auth, profile, connection). Microservices are independently deployable services with separate runtime boundaries.

### Key differences

- Deployment: one unit vs many units.
- Communication: in-process calls vs network calls.
- Data ownership: often shared DB in monolith vs per-service ownership in microservices.
- Operational complexity: low vs high (service discovery, retries, observability, deployment orchestration).

### Tradeoff summary

- Modular monolith wins on development speed and lower ops cost for early-stage products.
- Microservices win when teams and scale require independent release velocity and fault isolation.

### Interview closing line

Modular monolith is usually the right first architecture; microservices are an organizational and scaling decision, not a default coding style.

## 3) When would you break this into microservices? What would you split first?

### Strong answer

I would split when there is clear pressure in at least one of these dimensions:

- Team scaling: multiple teams frequently colliding in one codebase.
- Independent scaling: one domain has very different load profile (for example chat/notifications).
- Release independence: one domain must ship faster than others.
- Reliability isolation: failures in one domain should not impact critical auth/profile flows.

### First split candidates

1. Notification service: naturally async, event-driven, can scale independently.
2. Chat service: high throughput, websocket-heavy, different storage and performance needs.
3. Identity/auth service: only after maturity, since auth coupling is high and migration risk is non-trivial.

### Interview closing line

I would split by bounded context with clear data ownership, starting from async high-scale domains like notifications or chat.

## 4) What is a service layer? Why does your current code not have one and what is the problem?

### Strong answer

Service layer encapsulates business rules and orchestration logic between controllers/routes and repositories/data access.

Current code puts much logic in route files for MVP speed. That is common early, but it creates issues:

- Harder unit testing because logic is coupled to HTTP concerns.
- Logic duplication across endpoints over time.
- Lower maintainability as flows become more complex.

### Why service layer helps

- Controllers stay thin and transport-focused.
- Business logic becomes reusable and testable.
- Easier to introduce transactions, retries, policies, and domain rules.

### Interview closing line

Skipping service layer is acceptable for MVP, but adding it is the first structural refactor for long-term maintainability.

## 5) How would you design a horizontal scaling strategy for this app?

### Strong answer

I would make the API tier stateless and scale replicas behind a load balancer.

### Plan

1. Stateless app instances

- Keep auth token-based, avoid in-memory session state.
- Externalize shared concerns (Redis for rate-limit counters/caching).

2. Multi-instance deployment

- Run N identical API replicas behind reverse proxy/LB.
- Use health checks and rolling deployments.

3. Database scaling

- Add read replicas for heavy read endpoints (feed/requests).
- Introduce indexes for frequent query patterns.
- Consider sharding only when dataset growth demands it.

4. Resilience and observability

- Centralized logs, metrics, tracing.
- Circuit breakers/timeouts for external dependencies.

### Interview closing line

Scale the stateless API layer first, then optimize database read paths, then split high-throughput domains if needed.

## 6) How would you add a caching layer (Redis) to this project? Where would it help most?

### Strong answer

Redis should be introduced as a targeted cache and distributed control plane, not as blanket caching.

### Best first use cases

1. Rate limiting and abuse control

- Store signin attempt counters and TTL windows.

2. Read-heavy endpoint caching

- Cache /user/requests/received and feed-like responses for short TTL.
- Invalidate on connection status change or profile updates.

3. Session-adjacent controls

- Token deny-list or refresh token metadata.

### Cache design principles

- Key naming convention by domain and user id.
- Short TTLs to avoid stale social graph behavior.
- Explicit invalidation events on write paths.

### Interview closing line

Start Redis with rate limits and hot-read caching, then extend to token and event workflows as complexity grows.

## 7) How would you add a notification system (you got a connection request)?

### Strong answer

Use event-driven design. The connection module emits a domain event after successful request creation, and a notification processor handles delivery.

### Flow

1. Connection request created in DB.
2. Publish event: ConnectionRequestCreated.
3. Notification worker consumes event.
4. Create notification record and deliver via in-app channel (and optionally email/push).

### Components

- Event broker (Redis streams, RabbitMQ, or Kafka depending scale).
- Notification service/worker.
- Notification store (read model for user inbox).

### Why async

- Keeps API latency low.
- Retries and dead-letter handling become easier.
- Delivery channel changes do not affect core request API.

### Interview closing line

Notifications should be asynchronous and event-driven so core user actions stay fast and reliable.

## 8) Design a chat feature between two connected users. What DB model would you use?

### Strong answer

I would introduce two collections: Conversation and Message. Only users with accepted connection can create or continue a conversation.

### Data model

- Conversation
  - \_id
  - participantIds [userA, userB] (normalized/sorted)
  - lastMessageAt
  - lastMessagePreview
  - createdAt, updatedAt
  - unique index on participant pair

- Message
  - \_id
  - conversationId
  - senderId
  - content or contentRef
  - messageType (text/image/system)
  - deliveredAt, readAt
  - createdAt

### Query patterns

- Conversation list by participant + lastMessageAt desc.
- Paginated messages by conversationId + createdAt.

### Realtime transport

- WebSocket gateway for live delivery.
- Persist first, then publish to socket channel for durability.

### Interview closing line

Use conversation/message separation with strict authorization on accepted connections and paginated retrieval for scale.

## 9) How would you implement a block user feature without breaking existing logic?

### Strong answer

Introduce a Block relationship and enforce block checks in all interaction paths.

### Model options

- blocked_users collection
  - blockerUserId
  - blockedUserId
  - createdAt
  - unique composite index

### Enforcement points

1. Before sending connection request: reject if either direction has a block.
2. Before reviewing requests: reject if blocked.
3. In feed/search: exclude blocked users both directions.
4. In chat: deny message send and hide conversations depending policy.

### Migration behavior

- Existing accepted connections can be soft-hidden or auto-terminated on block based on product rule.
- Keep historical records for audit, but prevent future interactions.

### Interview closing line

Block is a cross-cutting authorization rule; centralize it as a policy check reused by connection, feed, and chat flows.

## 10) What would your folder structure look like if you introduced a service + repository layer?

### Strong answer

I would move from route-centric to feature-centric layered modules.

```text
src/
  app.js
  config/
    database.js
    redis.js
    env.js
  modules/
    auth/
      auth.routes.js
      auth.controller.js
      auth.service.js
      auth.repository.js
      auth.schema.js
    profile/
      profile.routes.js
      profile.controller.js
      profile.service.js
      profile.repository.js
    connection/
      connection.routes.js
      connection.controller.js
      connection.service.js
      connection.repository.js
      connection.policy.js
    user/
      user.routes.js
      user.controller.js
      user.service.js
      user.repository.js
    notification/
      notification.service.js
      notification.worker.js
      notification.repository.js
  middlewares/
    auth.middleware.js
    error.middleware.js
    rateLimit.middleware.js
  models/
    user.model.js
    connectionRequest.model.js
    block.model.js
    conversation.model.js
    message.model.js
  shared/
    errors/
      AppError.js
    logger/
      logger.js
    utils/
      validator.js
  events/
    publisher.js
    subscribers.js
```

### Why this structure works

- Clear responsibility boundaries.
- Easier testing per layer.
- Easier future extraction into microservices by copying module boundaries.

### Interview closing line

Feature-first modules plus service/repository layering improve maintainability now and reduce migration friction later.

## Bonus: 60-second architecture summary

This system is currently a modular monolith optimized for MVP velocity, with domain modules for auth, profile, and connection management over MongoDB. I intentionally kept deploy and ops simple, but I recognize route-layer coupling as technical debt. My next step is layering: controllers for transport, services for business rules, repositories for persistence. For scale, I would keep API stateless, add Redis for rate-limits and hot-read caching, and introduce event-driven notifications. If traffic and team size grow, I would split async and high-throughput domains first, especially chat and notifications, while preserving strict data ownership and clear API contracts.

## Rapid Revision Checklist

- Define modular monolith in one line.
- Mention exact microservice split triggers.
- Explain service layer pain in current code.
- State horizontal scaling sequence.
- Give concrete Redis use cases and invalidation strategy.
- Describe event-driven notifications and chat data model.
- Explain block-user as centralized policy.
- Show folder structure refactor confidently.
