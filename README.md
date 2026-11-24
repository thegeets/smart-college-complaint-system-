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