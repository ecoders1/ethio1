# How to Run the SQL Seed Files

The SQL files must be run in **separate queries** — do NOT paste all at once.

## Order to run:

### Step 1 — schema.sql
Copy and run the full `schema.sql` file.

### Step 2 — promote-admin.sql
Copy and run `promote-admin.sql` to set up admin user.

### Step 3 — seed-cs-exams.sql (CS 2015-2018 exams)
Run each `insert into public.exams` block separately:
1. First run only the exam INSERT (4 rows)
2. Then run each questions INSERT block one at a time

### Step 4 — seed-cs-model-exam.sql (CPU College Model Exam)
Run in this order — one block at a time:
1. The exam INSERT (1 row)
2. Questions 1-10
3. Questions 11-20
4. Questions 21-27
5. Questions 28-37
6. Questions 38-52
7. Questions 53-62
8. Questions 63-70
9. Questions 71-76
10. Questions 77-87
11. Questions 88-100
12. Final SELECT to verify count

## Tip
Select just the lines you want to run, then click "Run" in Supabase SQL Editor.
