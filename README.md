# Private Friends Memory & Life Journal Platform 📖

A private, collaborative web platform built for friend groups to preserve photos, videos, stories, blogs, group events, and memories in one persistent chronological space.

---

## 🚀 Features

- **Private Spaces**: Create isolated journal spaces for your friend circles.
- **Member Roles & Secure Invites**: Owner, Admin, and Member roles with secure token invitation links.
- **Memories & Stories/Blogs**: Share quick trip memories or long-form rich story entries.
- **Multi-Media Uploads**: Attach photos and videos with live pre-upload thumbnail previews.
- **Social Interactions**: Interactive emoji likes/reactions, comments, and in-app notifications.
- **Shared Albums & Events**: Organise trip galleries and schedule group reunions/moments.
- **Search & Filter**: Search memories, stories, albums, and events across date ranges or authors.
- **Framer Motion Animations**: Fluid UI transitions, card entrances, and modal popups.

---

## 🛠️ Stack & Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend & Database**: Next.js API Routes, Prisma ORM, SQLite (Local Dev) / PostgreSQL (Vercel & Render)
- **Authentication**: JWT HTTP-only Cookies & bcryptjs password hashing

---

## ⚙️ Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup & Seed**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Test Accounts Available**:
   - `alex@example.com` | `password123`
   - `sarah@example.com` | `password123`
   - `marcus@example.com` | `password123`

---

## 🌐 Deploying Live to Vercel

1. **Push Repository to GitHub**:
   Push this codebase to your GitHub repository.

2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com) -> **Add New** -> **Project**.
   - Select your GitHub repository.

3. **Environment Variables on Vercel**:
   Set the following Environment Variables in Vercel project settings:
   - `DATABASE_URL`: Your PostgreSQL database URL (e.g. from Vercel Postgres, Neon.tech, Supabase, or Render Postgres).
   - `JWT_SECRET`: A secure random string (e.g. `secret-32-chars-key-12345`).
   - `NEXT_PUBLIC_APP_URL`: Your production Vercel URL (e.g. `https://friends-journal.vercel.app`).

4. **Initialize Database Schema on Vercel Database**:
   Run database migration in your terminal pointing to production database:
   ```bash
   DATABASE_URL="your-production-postgres-url" npx prisma db push
   ```

5. **Deploy**:
   Vercel will run `npm run build` which automatically executes `prisma generate && next build`.

---

## 🌐 Deploying Live to Render

1. **Create Render PostgreSQL Database**:
   - On [Render Dashboard](https://dashboard.render.com), click **New** -> **PostgreSQL**.
   - Copy the **Internal / External Database URL**.

2. **Create Web Service on Render**:
   - Click **New** -> **Web Service** -> Connect your GitHub repository.
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

3. **Environment Variables on Render**:
   Add the environment variables in Render Web Service settings:
   - `DATABASE_URL`: Your Render PostgreSQL database URL.
   - `JWT_SECRET`: Your random secret key.
   - `NEXT_PUBLIC_APP_URL`: Your Render app URL (e.g. `https://friends-journal.onrender.com`).

4. **Push Database Schema**:
   In Render Shell or locally:
   ```bash
   DATABASE_URL="your-render-postgres-url" npx prisma db push
   ```

---

## 🧪 Testing

Run automated PRD verification test suite:
```bash
npm test
```
