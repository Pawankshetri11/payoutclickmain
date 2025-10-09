# Earnings & Withdrawal System - Complete Guide

## 🎯 System Overview

This platform uses a **monthly earnings cycle** with a specific withdrawal window and automatic commission deductions.

---

## 📅 How Earnings Work

### Monthly Cycle (Day 1 - Day 31)

```
Day 1-31: Users complete tasks and earn money
↓
Earnings are tracked separately from withdrawable balance
↓
On 1st of next month: Previous month earnings → Move to Balance
↓
Day 26-31: Withdrawal window opens
```

### Earnings Dashboard Display

1. **Today's Earning**: Tasks approved today
2. **Week's Earning**: Tasks approved in last 7 days
3. **Month's Earning**: Tasks approved this month (NOT yet in balance)
4. **Balance**: Earnings from PREVIOUS months (available for withdrawal during day 26-31)
5. **Total Earned**: Lifetime earnings across all tasks

### Key Rule:
- **Current month earnings** = Visible but NOT withdrawable yet
- **Balance** = Previous months' earnings = Withdrawable during withdrawal window

---

## 💰 How Tasks Generate Earnings

### Task Types

#### 1. **Code-Only Tasks**
- User submits job code
- System verifies code ✓
- **Earnings credited immediately**
- Status: Approved

#### 2. **Image Tasks** (Requires Admin Approval)
- User submits job code
- System verifies code ✓
- User uploads proof image
- **Admin reviews and approves**
- Earnings credited after admin approval
- Status: Pending → Approved

### Task Approval Flow
```
Task Submission
    ↓
Code Verification (Instant)
    ↓
[If image required] → Upload Image → Admin Review
    ↓
Task Approved
    ↓
Amount added to "Month's Earning"
    ↓
On 1st of next month → Moves to "Balance"
```

---

## 🏦 Withdrawal System

### Withdrawal Window
- **Available**: Day 26-31 of each month
- **Blocked**: Day 1-25 of each month

### Withdrawal Process

```
User requests withdrawal (Day 26-31)
    ↓
System calculates deductions:
    - 10% Platform Fee
    - 10% Referral Commission (if user was referred)
    OR
    - 20% Total to Company (if no referrer)
    ↓
Admin reviews request
    ↓
Admin approves → Money sent to user's payment method
```

### Commission Structure

#### If User Was Referred:
```
Withdrawal Amount: $100
Platform Fee (10%): -$10
Referral Commission (10%): -$10 (goes to referrer)
User Receives: $80
```

#### If User Was NOT Referred:
```
Withdrawal Amount: $100
Platform Fee (10%): -$10
No Referrer Fee (10%): -$10 (goes to company)
User Receives: $80
```

**Total Deduction: Always 20%**
- User always receives 80% of withdrawal amount
- 10% always goes to platform
- 10% goes to either referrer OR company

---

## 🔄 Referral System

### How It Works

1. **User A** signs up and gets referral code: `REF12345XYZ`
2. **User B** signs up using User A's code
3. User B completes tasks and earns money
4. When **User B withdraws**, 10% goes to **User A**
5. User A's referral commission is added to their balance

### Referral Code Format
- Format: `REF[USER_ID][RANDOM]`
- Example: `REF12345ABC`
- Unique per user

### Referral Earnings
- Referrers earn **10% of every withdrawal** made by their referrals
- No limit on referral earnings
- Commission is added directly to referrer's balance

---

## ⚙️ Admin Controls

### Configurable Settings (Admin Settings Page)

1. **Earnings Transfer Date**
   - Default: Day 1 of month
   - When to move current month earnings → Balance

2. **Withdrawal Window**
   - Start Date: Default Day 26
   - End Date: Default Day 31
   - Admin can change these dates anytime

### Admin Actions

1. **Approve/Reject Image Tasks**
   - Review uploaded proof images
   - Approve → Credits earnings
   - Reject → No earnings, user can resubmit

2. **Manage Withdrawals**
   - View all withdrawal requests
   - Approve → Mark as completed
   - Reject → Add reason, money returns to balance

3. **Manage Payment Dates**
   - Change when earnings transfer
   - Change withdrawal window dates

---

## 📊 Database Structure

### Key Tables

1. **tasks**: Stores task submissions and status
2. **profiles**: User balance and referral info
3. **withdrawals**: Withdrawal requests and status
4. **referrals**: Referral relationships and commissions
5. **payment_dates_config**: Configurable payment dates

### Task Status Flow
```
pending → approved → (earnings credited)
pending → rejected → (no earnings)
```

### Withdrawal Status Flow
```
pending → completed (approved by admin)
pending → rejected (with reason)
```

---

## 🔒 Security Features

1. **Withdrawal Window Enforcement**
   - Frontend blocks withdrawal button outside window
   - Backend validates withdrawal date

2. **Balance Verification**
   - System checks user has sufficient balance
   - Deducts amount + commissions atomically

3. **Referral Validation**
   - Prevents self-referral
   - One-time referral code usage per user

4. **Task Verification**
   - Code validation before approval
   - Image review for proof-based tasks
   - Prevents duplicate submissions

---

## 💡 Example User Journey

### Month 1
```
Jan 1-25: User completes 10 tasks = $100 earned
Jan 26-31: Balance = $0 (earnings not transferred yet)
Cannot withdraw
```

### Month 2
```
Feb 1: Previous month earnings ($100) → Moves to Balance
Feb 1-25: User completes 5 tasks = $50 earned
         Balance = $100 (withdrawable)
         Month Earning = $50 (not yet withdrawable)
Feb 26: Withdrawal window opens
        User withdraws $100
        Deductions: -$20 (10% platform + 10% referrer/company)
        User receives: $80
```

### Month 3
```
Mar 1: February earnings ($50) → Moves to Balance
       Balance = $50 (previous withdrawal cleared)
Mar 26-31: User can withdraw the $50 from February
```

---

## 🎓 Summary

**Key Points:**
1. ✅ Earnings are monthly and transfer on Day 1
2. ✅ Withdrawals only on Day 26-31
3. ✅ 20% total deduction (10% platform + 10% referral/company)
4. ✅ Current month earnings NOT withdrawable yet
5. ✅ Admin can change all payment dates
6. ✅ Image tasks need admin approval
7. ✅ Code tasks are instant
8. ✅ Referrals earn 10% forever

This system ensures:
- Fair commission distribution
- Regular monthly payouts
- Controlled withdrawal windows
- Transparent earnings tracking
