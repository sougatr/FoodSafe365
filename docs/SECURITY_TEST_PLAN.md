# FoodSafe365 Security Test Plan — MVP

1. Unauthenticated request to every protected endpoint returns 401.
2. User from organisation A cannot read organisation B by changing outlet_id (403/404).
3. User cannot write to another tenant's check/action/document.
4. Role permissions are enforced server-side.
5. Critical action state transitions cannot be performed by an unauthorized role.
6. Authentication endpoints are rate-limited in deployment.
7. Audit logs never contain passwords/tokens.
8. Evidence upload validates type/size and uses controlled object storage URLs.
9. Regression tests cover BOLA/IDOR for every outlet-scoped route.
