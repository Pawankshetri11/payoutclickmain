# Implementation Guide - Jobs, Tickets & Support System

## Overview
This guide covers the implementation of:
1. Job submission limits (single/multiple submissions per user)
2. Complete ticket system with admin replies
3. Admin content editor for support page
4. Telegram support integration

---

## Step 1: Database Setup

**Run the SQL script** `DATABASE_UPDATE_JOBS_TICKETS.sql` in your Supabase SQL Editor.

This script will:
- ✅ Add `submission_limit_per_user` column to jobs table
- ✅ Create `tickets` table for support tickets
- ✅ Create `ticket_replies` table for conversation threads
- ✅ Create `site_content` table for managing support page content
- ✅ Set up all necessary RLS policies
- ✅ Create indexes for performance
- ✅ Add triggers for automatic timestamp updates

---

## Step 2: Test the Features

### A. Job Submission Limits

1. Go to `/admin/jobs`
2. Click "Add Job"
3. You'll see a new field: **"Submission Limit (Per User)"**
   - Set to `1` for single submission only
   - Set to `>1` for multiple submissions allowed
4. Create a job and verify it shows the submission limit

**What it does:**
- Controls how many times a single user can submit the same job
- Default is 1 (single submission only)
- Useful for recurring tasks or multiple attempts

---

### B. Support Ticket System

#### For Users:
1. Go to `/support`
2. Click "Create Ticket"
3. Fill in:
   - Subject
   - Category (Technical, Payment, Account, General, Feedback)
   - Priority (Low, Medium, High)
   - Message
4. Submit the ticket
5. View your tickets in the "My Support Tickets" section

#### For Admins:
1. Go to `/admin/tickets`
2. You'll see:
   - Stats: Pending, Answered, Closed, High Priority counts
   - All tickets with user details
3. Click "View" or "Reply" on any ticket
4. In the ticket detail modal:
   - View the complete conversation thread
   - Send replies (automatically marks ticket as "Answered")
   - Change ticket status (Pending → Answered → Closed)
   - Close tickets directly

**Features:**
- ✅ Real-time ticket creation
- ✅ Threaded conversations (users can see admin replies)
- ✅ Status tracking (Pending, Answered, Closed)
- ✅ Priority levels (Low, Medium, High)
- ✅ Categories for organization
- ✅ User profile integration

---

### C. Support Page Configuration

#### Admin Side:
1. Go to `/admin/content-editor`
2. Select "Support Page" from dropdown or click "Support" tab
3. Configure:
   - **Email**: Support email address
   - **Phone**: Support phone number
   - **Telegram Username**: e.g., `@YourSupportBot`
   - **Telegram Link**: Full URL (e.g., `https://t.me/YourSupportBot`)
4. Click "Save All Changes"

#### User Side:
1. Go to `/support`
2. You'll see 4 contact cards:
   - **Email Support**: Click to copy email to clipboard
   - **Phone Support**: Click to copy phone number
   - **Telegram Support**: Click to open Telegram chat
   - **Live Chat**: Coming soon (placeholder)

**How Telegram Works:**
- Create a Telegram bot using [@BotFather](https://t.me/BotFather)
- Get your bot username (e.g., `@YourSupportBot`)
- Add the username and link in Content Editor
- Users can click to open Telegram and start chatting

---

## Step 3: How to Set Up Telegram Bot

### Creating a Telegram Bot:

1. **Open Telegram** and search for `@BotFather`

2. **Start a chat** with BotFather and send: `/newbot`

3. **Follow the prompts:**
   - Give your bot a name (e.g., "TaskHub Support")
   - Give it a username (must end in 'bot', e.g., "TaskHubSupportBot")

4. **You'll receive:**
   - Bot token (keep this secret!)
   - Bot username (e.g., `@TaskHubSupportBot`)

5. **Customize your bot:**
   - Send `/setdescription` to add a description
   - Send `/setabouttext` to add about text
   - Send `/setuserpic` to add a profile picture

6. **Get the chat link:**
   - Your bot link is: `https://t.me/YourBotUsername`
   - Example: `https://t.me/TaskHubSupportBot`

7. **Add to Content Editor:**
   - Telegram Username: `@TaskHubSupportBot`
   - Telegram Link: `https://t.me/TaskHubSupportBot`

### Alternative: Telegram Group

Instead of a bot, you can use a Telegram group:
1. Create a Telegram group
2. Make it public
3. Set a username (e.g., `TaskHubSupport`)
4. Link: `https://t.me/TaskHubSupport`

---

## Step 4: Testing Checklist

### Jobs System:
- [ ] Create a job with submission limit = 1
- [ ] Create a job with submission limit = 5
- [ ] Edit existing job and change submission limit
- [ ] Verify limits are saved correctly

### Ticket System:
- [ ] User can create a ticket
- [ ] Ticket appears in admin panel
- [ ] Admin can view ticket details
- [ ] Admin can send replies
- [ ] User can see admin replies
- [ ] Status changes work (Pending → Answered → Closed)
- [ ] Stats update correctly

### Support Page:
- [ ] Email displays correctly and copies to clipboard
- [ ] Phone displays correctly and copies to clipboard
- [ ] Telegram link opens in new tab
- [ ] Admin can edit all support page content
- [ ] Changes reflect immediately on user side

---

## Troubleshooting

### Tickets table doesn't exist:
Make sure you ran `DATABASE_UPDATE_JOBS_TICKETS.sql` completely.

### Can't see tickets:
Check RLS policies. Make sure you're logged in as admin.

### Submission limit not showing:
Refresh your browser cache or hard reload (Ctrl+Shift+R).

### Support content not loading:
The system uses default values if database content isn't found. This is normal for first-time setup.

### Telegram link doesn't work:
- Verify the link format: `https://t.me/BotUsername`
- Make sure the bot/group is public
- Test the link in a browser first

---

## Database Schema Reference

### Jobs Table (Updated)
```sql
- id: UUID
- title: TEXT
- description: TEXT
- category: TEXT
- type: 'code' | 'image'
- amount: DECIMAL
- vacancy: INTEGER
- completed: INTEGER
- status: 'active' | 'paused' | 'completed'
- submission_limit_per_user: INTEGER (NEW!)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Tickets Table (New)
```sql
- id: UUID
- user_id: UUID (FK)
- subject: TEXT
- message: TEXT
- category: TEXT
- priority: 'low' | 'medium' | 'high'
- status: 'pending' | 'answered' | 'closed'
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Ticket Replies Table (New)
```sql
- id: UUID
- ticket_id: UUID (FK)
- user_id: UUID (FK)
- message: TEXT
- is_admin: BOOLEAN
- created_at: TIMESTAMPTZ
```

### Site Content Table (New)
```sql
- id: UUID
- page_key: TEXT (UNIQUE)
- content: JSONB
- updated_at: TIMESTAMPTZ
- updated_by: UUID (FK)
```

---

## Next Steps

1. ✅ Run the database migration SQL
2. ✅ Test job creation with submission limits
3. ✅ Create a test support ticket as a user
4. ✅ Reply to the ticket as admin
5. ✅ Set up your Telegram bot
6. ✅ Configure support page in Content Editor
7. ✅ Test all contact methods

## Support

If you encounter any issues:
1. Check the console logs for errors
2. Verify database tables were created correctly
3. Ensure RLS policies are in place
4. Make sure you're logged in with the correct role (admin/user)
