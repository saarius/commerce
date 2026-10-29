---
"@dinkuskit/commerce": patch
---

Clarify CLI help and documentation that catalog preview confirmation is a freshness precheck, not an atomic write guard. Document reproducible lost-update cases involving edits after validation, CAS retries and media writes. Catalog write behavior is unchanged; no atomicity repair is claimed.
