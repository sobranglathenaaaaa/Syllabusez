# SyllabusPortal

School Syllabus Management System built with **Next.js App Router**, **JavaScript**, **MariaDB**, and **Tailwind CSS**.

## Features

- Role-based routes and dashboards for `admin`, `instructor`, and `student`
- Auth flow pages in `/(auth)/login` and `/(auth)/register`
- Syllabus Builder with dynamic outcomes and weekly plans
- Optimistic UI updates for adding and reordering weekly plans
- Server Actions for draft save operations
- File upload endpoint with signed URL retrieval for materials
- MariaDB schema at `db/schema.sql`

## Setup

```bash
npm install
npm run dev
```

Set environment variables:

- `DATABASE_URL` (MariaDB connection string, optional for local mock mode)
- `SIGNED_URL_SECRET` (secret used for signed material URLs)
