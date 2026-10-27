# Smart College Complaint System

> **Institution:** Soch College of IT, Pokhara  
> **Academic Program:** BSc CSIT Only  
> **Official Email:** `info@sochcollege.edu.np` | **Phone:** `061-574096`  
> **Campus Address:** Ranipauwa, Pokhara, Nepal  

---

## 1. Institutional Context & Boundaries

The **Smart College Complaint System** is a purpose-built, full-stack grievance portal engineered specifically for **Soch College of IT, Pokhara**.

### Confirmed Parameters:
- **Academic Program:** Exclusively **BSc CSIT** (Bachelor of Science in Computer Science and Information Technology). The college does not offer BIT, BCA, BIM, or other undergraduate degrees.
- **Facility Scope:** Campus workstations, network infrastructure, software tools, and classroom technology. There is **no hostel facility** at Soch College of IT.
- **Student Privacy:** Students **do not register accounts** or log in. To submit an IT grievance, students enter their basic institutional details, choose from 6 designated IT categories, and receive a **cryptographically generated Private Tracking Secret**. Complaints cannot be browsed publicly or queried by student roll number alone.
- **Administration:** Real, authenticated admin portal (`/admin/login`) secured by Argon2id password hashing, MongoDB session storage, CSRF tokens, and role authorization.
- **Branding & Logo:** An accessible, replaceable college logo mark is defined in `src/config/collegeConfig.js`. It is clearly documented as a replaceable placeholder and never misrepresented as an official seal.

---

## 2. System Architecture

```
                       [Public Student Flow]
                      /                      \
                     v                        v
             POST /complaints           POST /complaints/track
          (Name, CSIT ID, Title,      (Reference + Private Secret)
           Desc, Optional File)                    |
                     |                             v
                     v                    Safe Student View
           Unique Reference ID           (Status, History, Responses)
         + Private Tracking Secret        [No internal notes/hashes]
                     |
                     +--------------------+
                                          |
                                          v
                              [ MongoDB Database ]
                               (Grievance Store)
                                          ^
                                          |
                                          v
                                [ Admin Portal ]
                          - Express Session + MongoStore
                          - Argon2id Password Auth
                          - CSRF Protection (x-csrf-token)
                          - Audit Timelines & Responses
                          - Private Attachment Stream
```

### Technology Stack:
- **Frontend:** React 19, Vite, React Router 7, Lucide Icons, Plain Modular CSS
- **Backend:** Node.js, Express 4, Mongoose 8, express-session with connect-mongo
- **Security:** Argon2id (`argon2`), Helmet, CORS, Rate Limiters, CSRF Protection, Multer with Magic Byte Verification
- **Testing:** Node.js Native Test Runner (`node:test`), Supertest

---

## 3. Authorized IT Complaint Categories

1. `Computer Lab / Hardware` — Lab workstation hardware, peripherals, RAM, keyboards.
2. `Internet / Wi-Fi / Network` — Campus Wi-Fi, Ethernet jacks, lab switch connectivity.
3. `Software / Programming Tools` — IDEs, compilers, DBMS tools, Linux lab installations.
4. `Programming Classes / Assignments` — Practical lab scheduling, compiler mismatches.
5. `IT Project / Supervision` — BSc CSIT 7th/8th semester project lab facilities.
6. `Classroom Technology / Projector` — HDMI projectors, audio systems, smart screens.

---

## 4. Visual Design System

The application uses an understated, purposeful institutional color palette:
- **Page Background:** `#F8FAFC`
- **Surface / Cards:** `#FFFFFF`
- **Headings & Bold Elements:** `#0F172A`
- **Body Text:** `#475569`
- **Subtle Borders:** `#E2E8F0`
- **Primary Navy:** `#15365D`
- **Accent Teal:** `#0F766E`

No neon glow, floating particles, glassmorphism, or artificial statistics are used.

---

## 5. Prerequisites & Environment Setup

### Prerequisites:
- **Node.js:** v18.0.0 or higher
- **MongoDB:** v6.0 or higher (running locally on `mongodb://127.0.0.1:27017` or via MongoDB Atlas)

### Environment Configuration:
Copy the example environment configuration:
```bash
cp .env.example .env
```

Verify or update the variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smart_college_complaints
SESSION_SECRET=a_cryptographically_secure_random_string_min_32_characters
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads/attachments
MAX_FILE_SIZE_BYTES=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_SUBMISSIONS=10
RATE_LIMIT_MAX_TRACKING=30
RATE_LIMIT_MAX_LOGINS=5
```

---

## 6. Installation & Execution Commands

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize or Manage Admin Accounts
Admin credentials are **never hardcoded or committed**. Use the interactive setup CLI:
```bash
# Interactively create an administrator account
npm run create-admin
```
*(Prompts for Administrator Name, Email, and hidden Password with confirmation).*

To reset an existing administrator password via server console access:
```bash
npm run reset-admin-password
```

### Step 3: Run Academic Program Audits & Migrations
To ensure all existing records strictly reflect Soch College of IT's **BSc CSIT** program:
```bash
# Audit records for non-CSIT values
npm run audit-program

# Backfill and standardize existing database records
npm run migrate-program
```

### Step 4: Run Automated Tests
Execute the 21 integration tests covering submissions, magic byte attachment verification, tracking isolation, CSRF protection, and admin workflows:
```bash
npm test
```

### Step 5: Start the Full Application

#### Option A: Run Both Concurrently (Recommended for Development)
```bash
npm run dev:all
```

#### Option B: Run in Separate Terminals
```bash
# Terminal 1: Backend Express API (Port 5000)
npm run server

# Terminal 2: Frontend Vite Dev Server (Port 5173)
npm run dev
```

Open your browser at:
- **Public Grievance Portal:** `http://localhost:5173/`
- **Student Submission:** `http://localhost:5173/submit`
- **Private Tracking:** `http://localhost:5173/track`
- **Admin Portal Login:** `http://localhost:5173/admin/login`

### Step 6: Build Frontend Bundle for Production
```bash
npm run build
```

---

## 7. REST API Documentation

Base URL: `/api/v1`

### Public & Student Endpoints

| Method | Endpoint | Description | Rate Limited |
|---|---|---|---|
| `GET` | `/api/v1/health` | Operational health and database connectivity | No |
| `POST` | `/api/v1/complaints` | Submit a new grievance (Multipart form or JSON) | Yes (10 / 15m) |
| `POST` | `/api/v1/complaints/track` | Track grievance with `{ reference, trackingSecret }` | Yes (30 / 15m) |

#### Submission Payload (`POST /api/v1/complaints`):
- `studentName` (string, 2–80 chars, required)
- `studentId` (string, e.g. `SOCH-CSIT-2024-042`, required)
- `email` (valid email string, required)
- `category` (one of 6 authorized IT categories, required)
- `title` (string, 5–150 chars, required)
- `description` (string, 15–3000 chars, required)
- `priority` (`Low` \| `Medium` \| `High` \| `Urgent`, optional, default: `Medium`)
- `attachment` (file, optional, max 5 MB, JPG/PNG/PDF only)

#### Tracking Response (`POST /api/v1/complaints/track`):
Returns a safe student view:
```json
{
  "success": true,
  "complaint": {
    "reference": "CMP-2026-A8F2K",
    "title": "Workstation 14 Keyboard Key Fault",
    "category": "Computer Lab / Hardware",
    "program": "BSc CSIT",
    "status": "In Progress",
    "description": "...",
    "submittedAt": "2026-10-17T10:00:00.000Z",
    "hasAttachment": true,
    "responses": [
      {
        "responderName": "Er. Pradeep Karki",
        "message": "Spare mechanical keyboard allocated; technician replacing unit.",
        "createdAt": "2026-10-17T10:30:00.000Z"
      }
    ],
    "timeline": [...]
  }
}
```
*Note: Sensitive fields (tracking hashes, internal admin notes, disk paths) are strictly excluded.*

---

### Admin Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/auth/csrf` | Fetch CSRF token for current session | No |
| `POST` | `/api/v1/admin/auth/login` | Log in with `{ email, password }` | No (5 / 15m) |
| `POST` | `/api/v1/admin/auth/logout` | Destroy session and clear HttpOnly cookie | Yes |
| `GET` | `/api/v1/admin/auth/me` | Fetch currently authenticated admin profile | Yes |
| `PATCH` | `/api/v1/admin/auth/password` | Change password with current verification | Yes + CSRF |

---

### Admin Grievance Management Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/complaints` | List paginated complaints with filter & search | Yes |
| `GET` | `/api/v1/admin/complaints/:id` | Fetch full complaint details (includes student & notes) | Yes |
| `PATCH` | `/api/v1/admin/complaints/:id/status` | Update status (`Submitted` → `Under Review` → `In Progress` → `Resolved`) | Yes + CSRF |
| `POST` | `/api/v1/admin/complaints/:id/responses` | Add official response visible to student | Yes + CSRF |
| `POST` | `/api/v1/admin/complaints/:id/notes` | Add internal private administrator note | Yes + CSRF |
| `GET` | `/api/v1/admin/complaints/:id/attachment` | Securely stream private file attachment (`nosniff`) | Yes |
| `GET` | `/api/v1/admin/reports/summary` | Real-time MongoDB aggregation metrics | Yes |

---

## 8. Security & Storage Architecture

### 1. Cryptographic Safeguards
- **Password Hashing:** Passwords are encrypted using **Argon2id** (`type: argon2id`, `memoryCost: 65536`, `timeCost: 3`).
- **Tracking Secrets:** Private tracking tokens (`trk_<random32bytes>`) are issued once. Only their Argon2id hash is saved in MongoDB (`select: false`).
- **Session Protection:** Session identifiers are regenerated upon login and password changes to protect against session fixation.
- **CSRF Defense:** State-changing admin requests (`PATCH`, `POST`) require an `x-csrf-token` header matching the server session.

### 2. Private Attachments
- **Allowed Formats:** Strictly JPG, PNG, and PDF.
- **Validation Pipeline:** File extension and MIME type validation are enforced via Multer, followed by an **asynchronous magic byte inspection** that checks actual binary signatures. Disguised executables (`.exe` renamed to `.jpg`) or embedded HTML/SVG files are rejected and unlinked immediately.
- **Storage Location:** Files are stored outside the public document root in `uploads/attachments/` with randomly generated filenames (`att_<timestamp>_<hex>.<ext>`).
- **Access Control:** File downloads require authenticated administrator sessions. Direct public URLs to attachments do not exist.

---

## 9. Deployment & Production Guidelines

1. **Same-Origin Production Architecture:**
   Host the frontend and API under the same domain behind a reverse proxy (such as Nginx):
   - `/` serves the static built frontend assets from `dist/`
   - `/api/` proxies to the backend Node process on `localhost:5000`
2. **TLS / HTTPS:**
   In production, set `NODE_ENV=production`. Cookies will automatically enforce the `Secure` flag and strict same-site policies.
3. **Persistent Volumes:**
   Ensure the `uploads/attachments` directory is mounted on a durable persistent volume with scheduled backups.
4. **Database Backups:**
   Configure automated snapshots or `mongodump` cron routines for the `smart_college_complaints` database.

---

## 10. Honest List of Remaining Limitations

1. **Active Antivirus Scanning:**
   Magic byte signature and file extension validations are strictly implemented to block disguised files. However, an active antivirus daemon (e.g. ClamAV daemon) is not connected in this phase.
2. **Lost Tracking Code Recovery:**
   Because students do not maintain registered user accounts, automated self-service password/code resets do not exist. Students who lose their tracking credentials must contact the college support desk at `info@sochcollege.edu.np`.
3. **Outbound Notification Integrations:**
   SMS (e.g., Sparrow SMS) and third-party transactional email providers (e.g., SendGrid) are not bundled in this phase. Students check their progress on-demand through the portal's `/track` endpoint.
