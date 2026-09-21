# Paintora — Full-Stack Home Painting Service Booking Platform

> **"Professional painting services, made simple."**

Paintora is a full-stack home painting service platform. The platform features an animated split-viewport landing page with role-based authentication, a customer dashboard with real-time status tracking, an online booking system, and an internal administrative management portal backed by a relational MySQL database (`paintora_db`) and vanilla PHP 8 REST APIs.

---

## 1. Application Flow & Routing Architecture

A visitor landing at `/` is presented with the combined Customer & Admin authentication portal. Protected routes ensure that customers and administrators only access their respective portals.

| Route | Component | Access Control | Description |
|---|---|---|---|
| `/` | `AuthLandingPage` | Public (Redirects if logged in) | Split-screen login & sign-up with role toggle (`[Customer \| Admin]`), password strength indicator, and floating glass cards |
| `/home` | `HomePage` | Protected (Customer) | Customer dashboard: personalized greeting, quick shortcuts, popular packages, 4-step process, guarantees, and finish gallery |
| `/services` | `ServicesPage` | Protected (Customer) | Service catalog with live category filtering, search query matching, and starting estimates |
| `/services/:id` | `ServiceDetailsPage` | Protected (Customer) | Detailed service specifications, what's included checklist, and "Book Now" action |
| `/book` | `BookingPage` | Protected (Customer) | Appointment scheduling form with prefilled customer data, date/time pickers, and past date prevention |
| `/booking-confirmation/:id` | `BookingConfirmationPage` | Protected (Customer) | Instant confirmation view with generated Booking ID (`#1001`) and summary |
| `/track-booking` | `BookingStatusPage` | Protected (Customer) | Real-time 4-step milestone visualizer (*Pending* → *Confirmed* → *In Progress* → *Completed*), default customer appointment selector, and manual ID lookup |
| `/account` | `CustomerDashboardPage` | Protected (Customer) | Profile information and categorized upcoming/past appointment history |
| `/admin/dashboard` | `AdminDashboardPage` | Protected (Admin) | Internal management console: live SQL metric cards, service catalog CRUD modal, and status dropdown updater |
| `*` | Catch-All Redirect | Automatic | Routes logged-in customers to `/home`, admins to `/admin/dashboard`, and guests to `/` |

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite | Single-page reactive application |
| **Routing** | React Router v7 | Protected routes, deep linking, role redirects |
| **Design System** | Vanilla CSS3 | Warm cream (`#FAF8F5`), Terracotta (`#C85A32`), Charcoal (`#1C1C1C`) |
| **Typography** | Google Fonts | **Fraunces** (Display Serif) + **Plus Jakarta Sans** (UI Sans) |
| **Backend** | PHP 8.1+ | RESTful JSON API endpoints |
| **Database Driver**| PHP PDO | Real prepared statements (`ATTR_EMULATE_PREPARES => false`) |
| **Database** | MySQL 8.0+ / MariaDB | Normalized relational database (`paintora_db`) |
| **API Testing** | Postman | Automated test suites for Services, Bookings, Admin Stats, and Error scenarios |
| **Development** | XAMPP (Apache + PHP + MySQL) | Local development environment |

---

## 3. Project Directory Structure

```text
paintora/
│
├── backend/                               # PHP REST API Backend
│   ├── config/
│   │   └── database.php                   # Database credentials & PDO connection class
│   ├── utils/
│   │   └── response.php                   # Uniform JSON envelopes & CORS headers
│   └── api/
│       ├── services.php                   # GET, POST, PUT, DELETE services & search
│       ├── bookings.php                   # GET, POST, PUT, DELETE bookings & JOIN queries
│       ├── customers.php                  # Customer signup, login, session profile & logout
│       └── admin.php                      # Live aggregated MySQL statistics & admin login
│
├── frontend/                              # React Frontend (Vite)
│   ├── public/
│   │   ├── favicon.svg                    # Custom inline SVG brand favicon
│   │   └── images/                        # Real high-resolution photography assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.jsx                   # Scalable inline SVG brand logo (full, mark, light)
│   │   │   ├── Navbar.jsx                 # Dynamic role-based sticky navigation
│   │   │   ├── Footer.jsx                 # Brand footer with quick navigation links
│   │   │   ├── ServiceCard.jsx            # Service display card with neutral fallback block
│   │   │   └── StatusBadge.jsx            # Status indicators (Pending, Confirmed, In Progress, Completed, Cancelled)
│   │   ├── hooks/
│   │   │   └── useReveal.js               # IntersectionObserver scroll animation hook
│   │   ├── pages/
│   │   │   ├── AuthLandingPage.jsx        # Split-viewport combined Customer & Admin auth screen
│   │   │   ├── HomePage.jsx               # Customer landing dashboard
│   │   │   ├── ServicesPage.jsx           # Service catalog with category pills & search
│   │   │   ├── ServiceDetailsPage.jsx     # Detailed service specs, pricing & inclusions
│   │   │   ├── BookingPage.jsx            # Form prefilled with customer session data
│   │   │   ├── BookingConfirmationPage.jsx# Instant confirmation with reference #ID
│   │   │   ├── BookingStatusPage.jsx      # Order lookup by ID with 4-step progress stepper
│   │   │   ├── CustomerDashboardPage.jsx  # Customer profile & booking history
│   │   │   └── AdminDashboardPage.jsx     # Live SQL metric cards, service CRUD & booking manager
│   │   ├── services/
│   │   │   └── api.js                     # Centralized fetch wrapper with credentials: 'include'
│   │   ├── App.jsx                        # Route configuration & protected route wrappers
│   │   ├── main.jsx                       # Application entry point
│   │   └── index.css                      # Complete design system tokens & animations
│   ├── index.html                         # Semantic HTML5 root with meta tags & Google fonts
│   └── package.json
│
├── database/
│   └── paintora.sql                       # Complete MySQL schema, foreign keys & seed data
│
├── postman/
│   └── Paintora-API.postman_collection.json # Exported Postman collection with test scripts
│
├── README.md                              # Complete setup & technical documentation
└── AI-LOG.md                              # Verified AI pair-programming and design logs
```

---

## 4. Setup & Running Instructions

### 4.1 Database Setup (MySQL)
1. Start MySQL from your XAMPP Control Panel.
2. Open MySQL CLI or phpMyAdmin (`http://localhost/phpmyadmin`).
3. Import the schema:
   ```sql
   SOURCE c:/Users/RAGINI/Downloads/paintora/database/paintora.sql;
   ```

### 4.2 Backend Setup (PHP / XAMPP)
1. Copy the `paintora` project folder to `C:\xampp\htdocs\paintora`.
2. Ensure Apache is running in XAMPP.
3. Test the backend API in your browser:
   ```
   http://localhost/paintora/backend/api/services.php
   ```
   *(Should return JSON `{ "success": true, "message": "Services fetched successfully.", "data": [...] }`)*

### 4.3 Frontend Setup (React)
1. Open terminal in `c:\Users\RAGINI\Downloads\paintora\frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.

---

## 5. Seed Accounts for Testing

| Role | Email | Password | Access Path |
|---|---|---|---|
| **Customer** | `ragini@example.com` | `password123` | Select **Customer** tab on `/` |
| **Admin** | `admin@paintora.com` | `admin123` | Select **Admin** tab on `/` |

---

## 6. Image Credits & Attributions

All imagery is sourced under the free-to-use Unsplash licence:

| Image File | Description | Source / Photographer (Unsplash) |
|---|---|---|
| `auth-painting.jpg` | Professional painter rolling fresh coat of paint | [Photo by Ksenia Chernaya](https://unsplash.com/photos/e8e7689d7828) |
| `hero.jpg` | Professional painter rolling interior wall | [Photo by Roselyn Tirado](https://unsplash.com/photos/5185137a7f0f) |
| `interior.jpg` | Freshly painted living room interior | [Photo by Spacejoy](https://unsplash.com/photos/dd6b41faaea6) |
| `exterior.jpg` | Painted residential home exterior | [Photo by Scott Webb](https://unsplash.com/photos/45c003edd2be) |
| `single-room.jpg` | Bedroom with newly painted feature wall | [Photo by Spacejoy](https://unsplash.com/photos/3dadae4b4ace) |
| `full-home.jpg` | Bright multi-room home interior | [Photo by Jason Briscoe](https://unsplash.com/photos/17f0baa2a6c3) |
| `texture.jpg` | Designer stucco texture accent wall | [Photo by Francesca Tosolini](https://unsplash.com/photos/1c9102c219da) |
| `ceiling.jpg` | Painter working on white ceiling | [Photo by Theme Photos](https://unsplash.com/photos/c64695cc6952) |
| `woodwork.jpg` | Painted wooden door and trim | [Photo by Jan Antonin Kolar](https://unsplash.com/photos/2acc08aa25b5) |
| `process-consult.jpg`| Color consultation and paint swatches | [Photo by Patrick Perkins](https://unsplash.com/photos/19c1da9775ae) |
| `process-prep.jpg` | Floor and edge masking prep | [Photo by Greyson Joralemon](https://unsplash.com/photos/dcfebaa392e3) |
| `process-paint.jpg`| Coating application with roller | [Photo by Ksenia Chernaya](https://unsplash.com/photos/e8e7689d7828) |
| `process-clean.jpg`| Clean finished room inspection | [Photo by Spacejoy](https://unsplash.com/photos/990dced4db0d) |
| `gallery-1.jpg` to `4.jpg` | Real room finishes gallery | Spacejoy & Unsplash Interior Photographers |
