# SmartGenEduX - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. **Database**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)
2. **OpenAI API Key**: Get your API key from https://platform.openai.com
3. **Vercel Account**: Sign up at https://vercel.com

### Environment Variables
Configure these in your Vercel dashboard:

```env
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key
SESSION_SECRET=your-session-secret-key
ISSUER_URL=https://replit.com/oidc
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.vercel.app
```

### Deploy Steps

1. **Connect Repository**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Select this project

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add all required environment variables
   - Ensure DATABASE_URL points to your production database

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Your SmartGenEduX system will be live!

### Features Ready for Production

✅ **SmartGenEduX Logo Integration**
- Logo appears on all module pages
- Consistent branding across the platform

✅ **Export Capabilities**
- PDF export for all reports
- Excel/CSV export functionality
- Print-friendly layouts

✅ **WhatsApp Integration**
- Fee payment reminders
- Attendance notifications
- Teacher duty alerts

✅ **Vipu AI Assistant**
- Intelligent chatbot for queries
- Question paper generation
- Behavior pattern analysis

✅ **9 Core Modules**
- Fee Management with reconciliation
- Attendance Management
- Timetable Generator
- Behavior Tracker
- Report Tracker
- Question Paper Generation
- Invigilation Duty Allocation
- Student Distribution System
- Substitution Management

### Post-Deployment Setup

1. **Database Migration**
   ```bash
   npx drizzle-kit push
   ```

2. **Test All Features**
   - Login system
   - Module functionality
   - Export features
   - WhatsApp integration

3. **Configure Custom Domain** (Optional)
   - Add your custom domain in Vercel
   - Update REPLIT_DOMAINS environment variable

### Support
For deployment issues, contact your development team or refer to Vercel documentation.