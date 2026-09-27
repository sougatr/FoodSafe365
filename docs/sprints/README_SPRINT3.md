# FoodSafe365 MVP Sprint 3 — Auth + Tenant/RBAC foundation

Implemented:
- Server-side auth context from HttpOnly cookies
- Login/logout API foundation
- Outlet access guard on outlet-scoped API routes
- Organisation/outlet lineage check when DATABASE_URL is configured
- Demo-mode login retained for local UI development
- No client-side trust for outlet authorization

Important: this is a security foundation, not production authentication. Before deployment, replace demo login with a vetted identity/session provider, password hashing/MFA, refresh-token rotation, rate limiting, CSRF protections as applicable, and comprehensive tenant/BOLA tests.
