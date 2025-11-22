# 🚀 Quick Start Guide - StockMaster

## Prerequisites
- Node.js v16+ installed
- MongoDB running
- Backend server configured

## Step 1: Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Backend will run on: `http://localhost:8000`

## Step 2: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Step 3: Create First User

Since this is a fresh installation, you'll need to create your first user account.

### Option A: Using Backend API (Recommended)

Open a new terminal and run:

```bash
# Using curl (Git Bash or WSL on Windows)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Admin User\",\"email\":\"admin@stockmaster.com\",\"password\":\"admin123\",\"role\":\"MANAGER\"}"

# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"fullName":"Admin User","email":"admin@stockmaster.com","password":"admin123","role":"MANAGER"}'
```

### Option B: Using Postman or Thunder Client

**POST** `http://localhost:8000/api/v1/auth/register`

Body (JSON):
```json
{
  "fullName": "Admin User",
  "email": "admin@stockmaster.com",
  "password": "admin123",
  "role": "MANAGER"
}
```

### Option C: Direct Database Insert

If you have MongoDB Compass or mongosh:

```javascript
use stockmaster;

db.users.insertOne({
  fullName: "Admin User",
  email: "admin@stockmaster.com",
  password: "$2b$10$YourHashedPasswordHere", // Use bcrypt to hash "admin123"
  role: "MANAGER",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## Step 4: Login

1. Open browser: `http://localhost:5173`
2. You'll see the login page
3. Enter credentials:
   - **Email**: `admin@stockmaster.com`
   - **Password**: `admin123`
4. Click "Sign In"

## Step 5: Setup Your Inventory System

After logging in, you'll land on the Dashboard. Follow these steps to set up your system:

### 1. Create Categories (Manager Only)
Navigate to: **Categories** → Click **"Add Category"**

Example categories:
- Electronics
- Office Supplies
- Raw Materials
- Finished Goods

### 2. Create Locations
Navigate to: **Locations** → Click **"Add Location"**

Example locations:
- **Main Warehouse** (Type: INTERNAL)
- **Receiving Dock** (Type: INTERNAL)
- **Shipping Area** (Type: INTERNAL)
- **Inventory Loss** (Type: INVENTORY_LOSS) - Required for adjustments

### 3. Create Contacts
Navigate to: **Contacts** → Click **"Add Contact"**

Add both vendors and customers:
- **ABC Suppliers** (Type: VENDOR)
- **XYZ Corporation** (Type: CUSTOMER)

### 4. Create Products (Manager Only)
Navigate to: **Products** → Click **"Add Product"**

Create your first product with:
- Name, SKU, Category
- Minimum stock level
- Initial stock quantity
- Initial stock location

### 5. Start Operations

Now you can perform inventory operations:

- **Receipts**: Receive goods from vendors
- **Deliveries**: Send goods to customers
- **Transfers**: Move stock between locations
- **Adjustments**: Count and adjust inventory

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists in backend folder
- Check port 8000 is not in use

### Frontend won't start
- Check if backend is running
- Verify `.env.development` exists in frontend folder
- Check port 5173 is not in use

### Can't login
- Verify user was created successfully
- Check backend logs for errors
- Ensure email is verified (set `isEmailVerified: true` in database)
- Clear browser localStorage and cookies

### CORS errors
- Verify backend `CORS_ORIGIN` includes `http://localhost:5173`
- Check backend is running on port 8000

## Default Ports

- **Backend API**: http://localhost:8000
- **Frontend App**: http://localhost:5173
- **MongoDB**: mongodb://localhost:27017

## Environment Variables

### Backend `.env`
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/stockmaster
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

### Frontend `.env.development`
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=StockMaster
```

## Next Steps

1. ✅ Create categories for your products
2. ✅ Add warehouse locations
3. ✅ Add vendor and customer contacts
4. ✅ Create your first products
5. ✅ Start receiving inventory (Receipts)
6. ✅ Fulfill customer orders (Deliveries)
7. ✅ Move stock around (Transfers)
8. ✅ Perform stock counts (Adjustments)
9. ✅ Monitor dashboard for insights

## Features Available

### ✅ Working Now
- JWT Authentication (login/logout)
- Dashboard with live stats
- Categories management (CRUD)
- Contacts management (CRUD)
- Locations management (CRUD)
- User roles (Manager/Staff)
- Toast notifications
- Dark mode toggle

### 🚧 Coming Soon
- Product list view with search/filter
- Operations validation (stock movements)
- Stock ledger view
- Reports and analytics
- User profile settings
- Email notifications

## Support

If you encounter any issues:
1. Check backend console for error logs
2. Check browser console for frontend errors
3. Verify MongoDB is running and accessible
4. Ensure all environment variables are set correctly

Happy inventory management! 🎉
