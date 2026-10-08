# FoodSafe365 — Production PostgreSQL Backup & Disaster Recovery Strategy

**Document Version:** 1.0.0  
**Classification:** Operational Security & Reliability Manual  
**Applies To:** Production & Staging PostgreSQL Databases  

---

## 1. Executive Summary & Objectives

FoodSafe365 stores regulated food-safety compliance records, critical refrigeration logs, receiving inspections, customer food-safety feedback, and service provider corrective actions. Data loss or corruption directly impacts public health and regulatory compliance (FSSAI).

This strategy defines a **dual-layer backup architecture**:
1. **Infrastructure Layer (Managed Database Provider):** Continuous WAL (Write-Ahead Log) archiving for Point-in-Time Recovery (PITR) and automated daily snapshots.
2. **Logical Layer (Application Tooling):** Automated daily custom-format logical backups (`pg_dump -Fc`) encrypted with AES-256 and pushed to an isolated, immutable offsite storage bucket.

### Key Recovery Metrics
- **Recovery Point Objective (RPO):** **<= 5 minutes** (via continuous WAL shipping).
- **Recovery Time Objective (RTO):** **<= 30 minutes** (provision new database target and execute point-in-time restore).

---

## 2. Backup Specifications

| Parameter | Specification |
|---|---|
| **Backup Method** | Continuous WAL archiving + Daily `pg_dump -Fc` (PostgreSQL Custom Compressed Format) |
| **Frequency** | • **Continuous WAL:** Every 5 minutes or 16 MB segment<br>• **Logical Full Dump:** Daily at 02:00 UTC (off-peak)<br>• **Managed Snapshot:** Daily at 03:00 UTC |
| **Retention Policy** | • **Continuous PITR:** 14 days<br>• **Daily Logical Backups:** 30 days<br>• **Monthly Archives:** 12 months (end-of-month snapshot) |
| **Encryption** | • **In-Transit:** TLS 1.3 for all connection streams<br>• **At-Rest:** Cloud KMS / AES-256 GCM encryption on database volumes and storage buckets |
| **Storage Location** | Offsite cloud object storage (e.g., AWS S3 / GCP Cloud Storage) located in a **geographically distinct secondary region** from the primary database |
| **Immutability** | Bucket Object Lock enabled in **Compliance Mode** (WORM — Write Once, Read Many). Prevents deletion or modification even by root credentials during retention window |
| **Access Control** | • **Backup Agent:** Least-privilege IAM role with `PutObject` permission only (cannot read or delete existing backups)<br>• **Disaster Recovery Role:** Break-glass IAM role requiring MFA for `GetObject` and restore operations |

---

## 3. Credentials & Security Guidelines

- **Zero Hardcoded Credentials:** Database connection strings, passwords, and encryption keys must **NEVER** be committed to source code or configuration files.
- **Environment Variables:** Scripts consume `DATABASE_URL` (or `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`) provided by secure runtime secrets managers (e.g. AWS Secrets Manager, Doppler, Vault).
- **Zero Local Repository Backups:** Backup files must **NEVER** be stored inside the Git repository. `.gitignore` explicitly excludes all `*.dump`, `*.sql.gz`, and `*.bak` files.

---

## 4. Logical Backup Procedure (`scripts/backup.sh`)

Logical backups are executed using PostgreSQL's native `pg_dump` with custom binary format (`-Fc`), enabling parallel restores, blob handling, and schema filtering.

### Command Specification:
```bash
pg_dump \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --file="${BACKUP_FILE}" \
  "${DATABASE_URL}"
```

### Encryption & Upload Pipeline:
```bash
# 1. Create compressed dump
pg_dump -Fc "${DATABASE_URL}" > /tmp/backup.dump

# 2. Encrypt with KMS / OpenSSL AES-256
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in /tmp/backup.dump \
  -out /tmp/backup.dump.enc \
  -pass "env:BACKUP_ENCRYPTION_KEY"

# 3. Stream to immutable offsite bucket
aws s3 cp /tmp/backup.dump.enc s3://foodsafe365-backups-immutable/daily/$(date +%Y-%m-%d).dump.enc

# 4. Secure wipe local temporary files
shred -u /tmp/backup.dump /tmp/backup.dump.enc
```

---

## 5. Non-Destructive Restore Procedure (`scripts/restore.sh`)

> [!CAUTION]
> **NEVER execute a restore drill directly against the production database.**
> Restore tests must always target a clean, isolated staging or ephemeral test database.

### Step-by-Step Drill:
1. **Provision Clean Restore Target:**
   ```bash
   createdb -h localhost -p 5432 -U postgres foodsafe365_restore_test
   ```

2. **Retrieve & Decrypt Backup:**
   ```bash
   aws s3 cp s3://foodsafe365-backups-immutable/daily/2026-10-07.dump.enc /tmp/restore.dump.enc
   openssl enc -d -aes-256-cbc -pbkdf2 \
     -in /tmp/restore.dump.enc \
     -out /tmp/restore.dump \
     -pass "env:BACKUP_ENCRYPTION_KEY"
   ```

3. **Execute Restore (`pg_restore`):**
   ```bash
   pg_restore \
     --clean \
     --if-exists \
     --no-owner \
     --no-privileges \
     --dbname="${TARGET_DATABASE_URL}" \
     /tmp/restore.dump
   ```

4. **Verify Schema & Record Counts:**
   - Execute verification queries across core tables:
     - `SELECT count(*) FROM schema_migrations;`
     - `SELECT count(*) FROM grocery_outlets;`
     - `SELECT count(*) FROM grocery_temperature_logs;`
     - `SELECT count(*) FROM customer_feedback;`
     - `SELECT count(*) FROM service_providers;`
   - Compare record counts with pre-backup source ledger.

5. **Clean Up:**
   ```bash
   shred -u /tmp/restore.dump /tmp/restore.dump.enc
   dropdb -h localhost -p 5432 -U postgres foodsafe365_restore_test
   ```

---

## 6. Verification & Automated Testing

FoodSafe365 includes an automated non-destructive backup and restore test suite:
```bash
npm run test:backup-restore
```
This suite verifies:
- Backup snapshot generation from multi-table dataset
- Clean target database provisioning
- Complete restore of Grocery, Customer Feedback, and Service Provider entities
- Checksum validation and zero record loss
