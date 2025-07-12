# 🔄 **ReWear Platform - Complete Flow & Logic Explanation**

## 🌟 **COMPLETE USER JOURNEY**

### **🏠 1. Landing Page Experience**
```
User visits ReWear → Sees featured items carousel → Browses available items → Decides to join
```

**API Endpoints:**
- `GET /api/items/featured/` - Hero carousel with featured items
- `GET /api/items/` - Main item grid with pagination
- `GET /api/items/categories/` - Category filters
- `GET /api/items/stats/` - Platform statistics

---

### **🔐 2. User Authentication & Onboarding**
```
User Registration → Email verification → Welcome bonus (100 points) → Profile setup
```

**API Endpoints:**
- `POST /api/users/register/` - Create account with welcome bonus
- `POST /api/users/login/` - Login with JWT tokens
- `GET /api/users/me/` - Get user profile

**Welcome Flow:**
- New users get **100 points** immediately
- Can browse and like items right away
- Guided to upload their first item

---

### **📱 3. Item Discovery & Browsing**
```
Browse items → Filter by category/condition → Search by keywords → View item details → Like items
```

**API Endpoints:**
- `GET /api/items/search/?q=vintage&category=tops` - Advanced search
- `GET /api/items/{id}/` - Item details with images
- `POST /api/items/{id}/like/` - Like/unlike items

**Features:**
- **Smart filtering** by category, condition, size, color, price range
- **Search functionality** across title, description, tags, brand
- **Like system** for favorites
- **View tracking** for popularity metrics

---

## 🔄 **SWAP SYSTEM - THE CORE FEATURE**

### **📝 Step 1: Creating a Swap Request**
```
User A sees User B's item → Clicks "Request Swap" → Selects their item to offer → Sends message
```

**API Call:**
```javascript
POST /api/swaps/
{
  "requested_item": 5,        // Item they want
  "offered_item": 12,         // Item they're offering  
  "message": "I love your vintage jacket! Would you swap for my designer bag?"
}
```

**Validation Logic:**
- ✅ User cannot swap with themselves
- ✅ Can only offer items they own
- ✅ Both items must be available and approved
- ✅ Prevents duplicate requests

---

### **📬 Step 2: Receiving & Managing Requests**
```
User B receives notification → Views swap request → Sees offered item → Accepts or rejects
```

**Dashboard API:**
```javascript
GET /api/users/my_activity/
// Returns recent swap requests received
```

**Response & Action:**
```javascript
POST /api/swaps/{id}/accept/    // Accept the swap
POST /api/swaps/{id}/reject/    // Reject the swap
```

---

### **🤝 Step 3: Swap Negotiation & Completion**
```
Swap accepted → Items marked as 'pending' → Users coordinate meetup → Mark as completed
```

**Status Flow:**
1. **PENDING** - Initial request sent
2. **ACCEPTED** - Item owner agrees, items reserved
3. **COMPLETED** - Physical exchange done, points awarded
4. **REJECTED** - Request declined

**Completion API:**
```javascript
POST /api/swaps/{id}/complete/
// Both users earn 5 points
// Items marked as 'swapped'
```

---

## 👤 **USER DASHBOARD - THREE CORE SECTIONS**

### **📊 1. Personal Details & Stats**
```javascript
GET /api/users/me/
GET /api/users/dashboard/
```

**Shows:**
- Profile info (name, email, location)
- **Points balance** (for redemptions)
- Total items uploaded
- Successful swaps completed
- Items liked/favorited
- Engagement metrics (views, likes received)

### **📦 2. My Listings Management**
```javascript
GET /api/items/my/
```

**Features:**
- **Grid view** of uploaded items
- **Status tracking** (pending approval, available, in swap, swapped)
- **Edit/delete** capabilities
- **Performance metrics** (views, likes per item)
- **Quick upload** new items

### **🔄 3. My Swaps & Purchases**
```javascript
GET /api/swaps/
```

**Two Types:**
- **Swaps Sent** - Requests I made to others
- **Swaps Received** - Requests others made to me

**Organized by Status:**
- **Pending** - Awaiting response
- **Accepted** - Ready for meetup
- **Completed** - Successfully exchanged
- **Rejected** - Declined requests

---

## 📱 **ITEM DETAIL PAGE - COMPLETE EXPERIENCE**

### **🖼️ Image Gallery & Information**
```javascript
GET /api/items/{id}/
```

**Shows:**
- **Multi-image carousel** with zoom
- **Full description** and story
- **Item details** (size, condition, brand, color)
- **Point value** for redemption
- **Tags** for discoverability

### **👤 Owner Information**
```javascript
// Included in item detail response
"owner": {
  "username": "fashion_lover",
  "points": 120,
  "successful_swaps": 15
}
```

### **🔄 Action Options**
**For Authenticated Users:**
```javascript
// If not owner
POST /api/items/{id}/like/          // Like/favorite
POST /api/swaps/                    // Request swap

// If owner  
PUT /api/items/{id}/                // Edit item
DELETE /api/items/{id}/             // Delete item
```

---

## 📝 **ADD NEW ITEM - COMPREHENSIVE UPLOAD**

### **🖼️ Image Upload System**
```javascript
POST /api/items/
// FormData with multiple images
```

**Features:**
- **Up to 5 images** per item
- **Primary image** selection
- **Alt text** for accessibility
- **Image ordering** for gallery

### **📋 Rich Metadata Collection**
```javascript
{
  "title": "Vintage Levi's Jacket",
  "description": "Classic denim jacket from the 80s...",
  "category": "outerwear",
  "size": "M",
  "condition": "excellent", 
  "brand": "Levi's",
  "color": "Blue",
  "tags_list": ["vintage", "denim", "classic"],
  "point_value": 25
}
```

**Smart Features:**
- **Point value suggestions** based on category/condition
- **Tag autocomplete** from popular tags
- **Validation** to ensure quality listings

---

## 🛡️ **ADMIN MODERATION SYSTEM**

### **📋 Content Approval Workflow**
```
Item uploaded → Admin review → Approve/reject → User notification
```

**Admin Panel Features:**
- **Bulk approval** of multiple items
- **Rejection reasons** with feedback
- **Featured item** promotion
- **User management** and stats

### **🚫 Safety & Quality Control**
- **Image moderation** for inappropriate content
- **Spam detection** for fake listings
- **User reporting** system
- **Quality scoring** based on engagement

---

## 🎯 **COMPLETE API ECOSYSTEM**

### **🏠 PUBLIC APIS (No Auth Required)**
```
GET /api/items/                    # Browse all items
GET /api/items/featured/           # Homepage carousel
GET /api/items/categories/         # Filter options
GET /api/items/{id}/               # Item details
GET /api/items/search/             # Advanced search
GET /api/items/stats/              # Platform stats
```

### **👤 USER APIS (Authentication Required)**
```
POST /api/users/register/          # Sign up
POST /api/users/login/             # Sign in
GET  /api/users/me/                # Profile
GET  /api/users/dashboard/         # Dashboard stats
GET  /api/users/my_activity/       # Activity feed
GET  /api/users/liked_items/       # Favorites
```

### **📦 ITEM MANAGEMENT APIS**
```
POST /api/items/                   # Upload item
PUT  /api/items/{id}/              # Update item
DELETE /api/items/{id}/            # Delete item
GET  /api/items/my/                # My listings
POST /api/items/{id}/like/         # Like/unlike
```

### **🔄 SWAP APIS**
```
GET  /api/swaps/                   # My swap requests
POST /api/swaps/                   # Create swap request
POST /api/swaps/{id}/accept/       # Accept swap
POST /api/swaps/{id}/reject/       # Reject swap
POST /api/swaps/{id}/complete/     # Complete swap
POST /api/swaps/{id}/cancel/       # Cancel swap
```

---

## 💡 **KEY BUSINESS LOGIC**

### **🎁 Point System**
- **Welcome bonus**: 100 points for new users
- **Swap completion**: 5 points per successful swap
- **Future**: Point redemption for items without swapping

### **📊 Engagement Gamification**
- **View counts** for item popularity
- **Like system** for user preferences  
- **Success metrics** for user reputation
- **Leaderboards** (future feature)

### **🔒 Trust & Safety**
- **Item ownership verification**
- **Swap request validation**
- **Status tracking** for transparency
- **Admin moderation** for quality

---

## 🚀 **HACKATHON DEMO FLOW**

### **⚡ 3-Minute Demo Script:**

1. **🏠 Landing** (30s) - Show featured items, browse grid
2. **🔐 Register** (30s) - Quick signup, welcome bonus
3. **📱 Browse** (60s) - Search, filter, like items
4. **🔄 Swap** (60s) - Request swap, show dashboard
5. **📊 Dashboard** (60s) - Personal stats, my items, swap management

### **🎯 Key Selling Points:**
- **Sustainable fashion** - Reduce textile waste
- **Community driven** - Person-to-person exchanges
- **Gamified experience** - Points, stats, engagement
- **Trust system** - Moderation, verification, transparency
- **Mobile optimized** - Modern, responsive design

---

This is a **complete, production-ready platform** that addresses real environmental concerns while providing an engaging user experience! 🌍✨
