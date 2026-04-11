# User Guide

Welcome to PopReklam! This guide will help you understand how to use the platform effectively, whether you're a Publisher monetizing your website traffic or an Advertiser running campaigns.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [For Publishers](#for-publishers)
3. [For Advertisers](#for-advertisers)
4. [Account Settings](#account-settings)
5. [FAQ](#faq)

---

## Getting Started

### Creating an Account

1. Visit the homepage at `http://yourdomain.com`
2. Click **"Get Started"** or **"Sign Up"**
3. Choose your account type:
   - **Publisher** - If you have websites and want to monetize traffic
   - **Advertiser** - If you want to run ad campaigns
4. Fill in your information:
   - Email address
   - Password (minimum 8 characters)
   - Company name (optional)
5. Click **"Create Account"**
6. You'll be redirected to your dashboard

### Logging In

1. Go to `/login`
2. Enter your email and password
3. Click **"Sign In"**
4. You'll be redirected to your role-specific dashboard

---

## For Publishers

Publishers monetize their website traffic by displaying ads from advertisers.

### Dashboard Overview

Your Publisher Dashboard shows:
- **Total Impressions** - Number of ad views
- **Revenue** - Money earned
- **Average CPM** - Cost per 1000 impressions
- **Active Sites** - Number of approved websites

### Adding a Website

1. Click **"Add New Site"** button
2. Fill in the form:
   - **Website URL** - Your site address (e.g., `https://example.com`)
   - **Site Name** - Friendly name for identification
   - **Category** - Select the most relevant category
   - **Description** (optional) - Brief description of your site
3. Click **"Add Site"**
4. Your site will be in **"Pending"** status until reviewed

**Note:** Only sites with quality content and legitimate traffic will be approved.

### Getting Ad Codes

Once your site is approved:

1. Go to **"Ad Codes"** page
2. Select your website
3. Choose ad format:
   - **Popunder** - Opens ad in new window
   - **In-Page Push** - Native push notification style
   - **Native** - Blends with your content
4. Copy the generated code
5. Paste it into your website's HTML

**Example Integration:**

```html
<!-- Place before closing </body> tag -->
<script src="https://yourdomain.com/adserve.js"></script>
<script>
  PopAds.init({
    zoneId: 'YOUR_ZONE_ID',
    siteId: 'YOUR_SITE_ID'
  });
</script>
```

### Managing Sites

**Edit a Site:**
1. Go to **"Sites"** page
2. Click the **Edit** icon (pencil) next to the site
3. Modify name or category
4. Click **"Save Changes"**

**Note:** You cannot change the URL after creation.

**Delete a Site:**
1. Go to **"Sites"** page
2. Click the **Delete** icon (trash) next to the site
3. Confirm deletion

**⚠️ Warning:** Deleting a site removes all associated statistics.

### Viewing Statistics

**Overview Stats:**
- View in the main Dashboard
- Shows last 7 days by default
- Revenue graph shows daily earnings

**Detailed Stats:**
1. Go to **"Statistics"** page
2. Filter by:
   - Date range
   - Specific website
   - Ad format
3. View metrics:
   - Impressions
   - Clicks
   - CTR (Click-Through Rate)
   - Revenue
   - CPM

### Requesting Payment

**Minimum Withdrawal:** $50

**Steps:**
1. Go to **"Payments"** page
2. Check your available balance
3. Click **"Request Payout"**
4. Choose payment method:
   - PayPal
   - Wire Transfer
   - Bitcoin
5. Enter payment details
6. Click **"Submit Request"**
7. Payment status will show as "Pending"
8. Typically processed within 5-7 business days

**Payment History:**
- View all past transactions
- Check withdrawal status
- Download payment reports

### Profile Settings

1. Go to **"Settings"** page
2. Update:
   - Company name
   - Contact information
   - Password
   - Payment details
   - Notification preferences

---

## For Advertisers

Advertisers create and manage ad campaigns to drive traffic to their products/services.

### Dashboard Overview

Your Advertiser Dashboard shows:
- **Total Spend** - Money spent on campaigns
- **Total Impressions** - Ad views generated
- **Total Clicks** - Number of clicks received
- **Active Campaigns** - Running campaigns
- **Account Balance** - Available funds

### Adding Funds

Before creating campaigns, add funds to your account:

1. Go to **"Billing"** page
2. Click **"Add Funds"**
3. Choose amount (minimum $50)
4. Select payment method:
   - Credit/Debit Card
   - PayPal
   - Bitcoin
5. Complete payment
6. Funds appear in your balance instantly

### Creating a Campaign

1. Go to **"Campaigns"** page
2. Click **"Create Campaign"**
3. Fill in campaign details:

**Step 1: Campaign Basics**
- Campaign name
- Target URL (where clicks go)
- Ad format

**Step 2: Budget & Bidding**
- Total budget
- Daily budget (optional)
- Bid amount (CPM - cost per 1000 impressions)

**Step 3: Targeting**
- **Countries** - Select target countries
- **Devices** - Desktop, Mobile, Tablet
- **Operating Systems** - Windows, Mac, Android, iOS
- **Browsers** - Chrome, Firefox, Safari, Edge

**Step 4: Review & Launch**
- Review all settings
- Click **"Submit for Approval"**
- Campaign status: "Pending Approval"

**Approval Time:** Usually 1-24 hours

### Managing Campaigns

**View Campaigns:**
1. Go to **"Campaigns"** page
2. See all campaigns with status:
   - **Active** - Running
   - **Paused** - Temporarily stopped
   - **Pending** - Awaiting approval
   - **Completed** - Budget exhausted

**Edit Campaign:**
1. Click **Edit** icon
2. Modify:
   - Budget
   - Bid amount
   - Targeting settings
3. Save changes

**Note:** Major changes may require re-approval.

**Pause/Resume Campaign:**
- Click the Pause icon to stop
- Click Resume to restart

**Delete Campaign:**
- Click Delete icon
- Confirm deletion
- Unspent budget returns to account

### Campaign Statistics

**Real-time Metrics:**
- Impressions served
- Clicks received
- CTR (Click-Through Rate)
- Spent amount
- Average CPC (Cost Per Click)

**Detailed Analytics:**
1. Go to **"Statistics"** page
2. Select campaign
3. View breakdowns by:
   - Date
   - Country
   - Device
   - Browser/OS

### Billing & Invoices

**View Transactions:**
1. Go to **"Billing"** page
2. See transaction history:
   - Deposits
   - Campaign spending
   - Refunds

**Download Invoices:**
- Click on any transaction
- Download PDF invoice

### Profile Settings

1. Go to **"Settings"** page
2. Update:
   - Company information
   - Billing address
   - Password
   - Email notifications
   - API access (advanced)

---

## Account Settings

### Changing Password

1. Go to **Settings** → **Password**
2. Enter current password
3. Enter new password (min. 8 characters)
4. Confirm new password
5. Click **"Update Password"**

### Email Notifications

Configure which emails you receive:

**For Publishers:**
- [ ] Site approval/rejection
- [ ] Payment processed
- [ ] Low earnings alert
- [ ] Weekly reports

**For Advertisers:**
- [ ] Campaign approval/rejection
- [ ] Low balance warning
- [ ] Campaign completed
- [ ] Weekly reports

### API Access (Advanced)

1. Go to **Settings** → **API**
2. Click **"Generate API Key"**
3. Copy and save your key securely
4. Use in API requests:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://yourdomain.com/api/publisher/stats
```

---

## FAQ

### General

**Q: How long does account approval take?**  
A: Accounts are typically approved instantly. Sites and campaigns may take up to 24 hours.

**Q: Is there a minimum deposit?**  
A: Yes, minimum deposit for advertisers is $50.

**Q: What payment methods do you accept?**  
A: We accept PayPal, Credit/Debit cards, Wire Transfer, and Bitcoin.

### For Publishers

**Q: How much can I earn?**  
A: Earnings depend on traffic quality, geography, and niche. Average CPM ranges from $2-$10.

**Q: When do I get paid?**  
A: Payments are processed within 5-7 business days after request.

**Q: What is the minimum payout?**  
A: Minimum withdrawal is $50.

**Q: Why was my site rejected?**  
A: Common reasons include low-quality content, illegal content, or fake traffic.

**Q: Can I use ads on multiple sites?**  
A: Yes! Add all your sites to your account.

### For Advertisers

**Q: How does bidding work?**  
A: Higher bids get more impressions. We recommend starting at $3-5 CPM.

**Q: Can I target specific websites?**  
A: Currently, targeting is by category, country, device, and OS. Site-level targeting coming soon.

**Q: What's a good CTR?**  
A: Average CTR is 1-3%. Popunder ads typically have lower CTR but higher conversion.

**Q: Can I pause my campaign anytime?**  
A: Yes, pause/resume anytime. Unspent budget remains in your account.

**Q: What happens to unspent budget?**  
A: It stays in your account balance for future campaigns.

---

## Getting Support

Need help?

1. **Check this Guide** - Most questions are answered here
2. **Review Installation Guide** - For technical setup issues
3. **Check FAQ** - Common questions and answers
4. **Contact Support** - Email: support@yourdomain.com

---

## Tips for Success

### Publisher Tips
✅ Quality traffic converts better → higher CPM  
✅ Diversify ad formats for maximum revenue  
✅ Monitor stats regularly to optimize  
✅ Place ads strategically (not too intrusive)  
✅ Build traffic first, then monetize

### Advertiser Tips
✅ Start with small budgets to test  
✅ A/B test different targeting settings  
✅ Monitor CTR and adjust bids accordingly  
✅ Use specific targeting for better ROI  
✅ Pause underperforming campaigns quickly

---

**Thank you for using PopReklam!** 🚀

For technical questions, see `INSTALLATION.md`  
For feature requests and updates, check `CHANGELOG.md`
