# Bihar AI Mission — Database

## Supabase Schema & Migrations

All SQL migration files are stored in `migrations/` and numbered in order of execution.

### Migration Files

| # | File | Description |
|---|------|-------------|
| 001 | `001_complete_schema.sql` | Full schema baseline — all tables, RLS policies, indexes |
| 002 | `002_cms_tables.sql` | CMS content management tables |
| 003 | `003_registered_users.sql` | User registration table |
| 004 | `004_user_details.sql` | Extended user profile details |
| 005 | `005_user_enrollments.sql` | Course/program enrollment tracking |
| 006 | `006_masterclasses.sql` | Masterclass content and scheduling |
| 007 | `007_officer_programs.sql` | Officer training program tables |
| 008 | `008_exam_submissions.sql` | Exam submission and grading |
| 009 | `009_get_involved.sql` | Community involvement/signup table |
| 010 | `010_delete_user_rpc.sql` | RPC function for user account deletion |

### How to Run

1. Go to **Supabase Dashboard → SQL Editor**
2. Run migrations in numerical order (001 → 010)
3. `001_complete_schema.sql` is the full baseline — run this first for a fresh setup

> **Note:** `001_complete_schema.sql` contains the complete schema. Individual migration files (002–010) are for incremental changes and reference.
