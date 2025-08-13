#  Fullstack Authentication System (Django + React)

A secure, full-featured authentication system with:

- **User registration & login** (JWT-based)
- **Multi-Factor Authentication (MFA)** support
- **Protected Routes**
- **Password reset via email**
- Fully responsive **React frontend**
- **DRF backend API**

---

##  Features

### **Backend (Django REST Framework)**
- JWT authentication (`access` + `refresh` tokens)
- User registration, login
- MFA (two-factor) support using a temporary `mfa_token`
- Password reset via email with `uidb64` + `token`


### **Frontend (React)**
- Login, register, and MFA verification pages
- Forgot & reset password flows
- ProtectedRoute wrapper to guard private pages
- Beautiful UI with responsive CSS
- API integration via Axios
- Automatic token expiration handling

---

##  Tech Stack

**Backend:**
- Python 3.x
- Django 4.x
- Django REST Framework
- SimpleJWT
- django-cors-headers

**Frontend:**
- React 18+
- React Router v6
- Axios
- jwt-decode

---

##  Backend Setup

1️ **Clone the repo & navigate to backend folder**
```bash
git clone {repo_url}
cd backend
```

2️ **Create virtual environment & install dependencies**
```bash
python -m venv venv
source venv/bin/activate  # (Linux/Mac)
venv\Scripts\activate     # (Windows)

pip install -r requirements.txt
```

3️ **Create `.env` file**
```env
SECRET_KEY=your_secret_key
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password (App Password)
```

4️ **Apply migrations & create superuser**
```bash
python manage.py migrate
python manage.py createsuperuser
```

5️ **Run backend**
```bash
python manage.py runserver
```

Backend runs at: **`http://localhost:8000`**

---

##  Frontend Setup

1️ **Navigate to frontend folder**
```bash
cd frontend
cd mfa-frontend
```

2️ **Install dependencies**
```bash
npm install
```




3️ **Run frontend**
```bash
npm start
```

Frontend runs at: **`http://localhost:3000`**

---

## API Endpoints

| Method | Endpoint                          | Description |
|--------|-----------------------------------|-------------|
| POST   | `/api/register/`                  | Register new user |
| POST   | `/api/login/`                     | Login (MFA optional) |
| POST   | `/api/mfa/login/verify/`          | Verify MFA code |
| GET    | `/api/mfa/setup/`                 | Sets Up for MFA Code |
| POST   | `/api/mfa/setup/verify`           | Verifies set Up for MFA Code |
| GET    | `/api/mfa/status`                 | Checks status of MFA of certain user |
| POST   | `/api/password-reset/request/`    | Request password reset |
| POST   | `/api/password-reset/confirm/`    | Confirm password reset |

---

## MFA Workflow

1. User logs in with username & password.
2. Backend responds:
   - If MFA enabled → `{ mfa_required: true, mfa_token: "..." }`
   - If MFA disabled → `{ access: "...", refresh: "..." }`
3. On MFA page, user enters 6-digit code.
4. If correct → access & refresh tokens stored in `localStorage`.

---

##  Password Reset Workflow

1. User clicks **"Forgot Password"**.
2. Enters email → backend sends reset link:  
   `http://{frontend_url}/reset-password/<uidb64>/<token>`
3. User sets new password → redirected to login.

---

##  Protected Routes

Frontend uses `ProtectedRoute`:
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```
- If `access` token missing/expired → redirect to `/login`.
- If logged in & on `/login` → redirect to `/dashboard`.
