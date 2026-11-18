# Momentum Source Security Audit — 2026-11-18

## Deployment and architecture
The last observed GitHub Pages deployment of main was successful (run 42209699499).
The static website and the Express backend are separate: GitHub Pages does not run server.ts.
The existing frontend can use VITE_API_BASE_URL to connect to a separately deployed backend.

## Confirmed production blockers
1. The previous backend exposed quotes, shipments, fleet, drivers and email audits without server-side authentication and allowed unauthenticated status and dispatch changes.
2. The customer portal initializes as authenticated and uses a hardcoded example customer; it is not a verified customer session.
3. Role switching in Operations Command Center is purely client-side.
4. Quotes, shipment updates and email audits are held in process memory, not durable storage.
5. The mail "queued" status is process memory only: data disappears on restart.
6. There is no deployed backend shown in this audit and API base URL must be explicitly configured.
7. CI only built the Pages artifact; it did not exercise TypeScript checking, backend integration tests or access-control tests.
8. The backend start script uses 'node server.ts' and needs a production-validated compiled runtime.
9. The existing HTML favicon uses /favicon.png, which breaks on a project-based GitHub Pages deployment.

## Immediate mitigation on this audit branch
Backend management and customer-record routes fail closed (503 SECURE_BACKEND_REQUIRED) in production.
The full demo operations API is usable only with ENABLE_DEMO_OPERATIONS=true outside production.
Customer submissions and basic AI support retain their original public routes.
Do not deploy the backend as live production intake until rate-limiting, spam prevention, durable persistence and delivery guarantees are in place.
A non-production demo remains allowed, but must not be exposed as an actual customer portal.

## Next development gate
Implement authenticated sessions, server-enforced RBAC and tenant scoping, PostgreSQL/Supabase persistence, field validation and anti-abuse, protected audit logs and reliable mail outbox, backend build/start and integration tests, then update the frontend to use the protected APIs.
Do not treat a successful frontend Pages workflow as evidence of backend readiness.
