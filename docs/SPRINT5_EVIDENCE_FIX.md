# Sprint 5 Evidence Upload Fix

The evidence control now uses an explicit button wired to a hidden native file input via React ref. This avoids relying on a transparent input overlay and is more reliable in Safari.

Accepted types: JPG, JPEG, PNG, PDF. Maximum size: 10 MB.

The MVP validates the selected file client-side and server-side. Demo mode records validated upload metadata; production object storage remains a separate integration step.
