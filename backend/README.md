# Billiards Backend API

Backend API cho ứng dụng quản lý billiards được xây dựng với Node.js, Express và MongoDB theo mô hình MVC.

## Tính năng chính

- **Authentication & Authorization**: Đăng ký, đăng nhập, JWT token
- **Quản lý quán billiards**: CRUD clubs với geospatial queries
- **Quản lý bàn**: CRUD tables với trạng thái real-time
- **Đặt bàn**: Booking system với validation và conflict checking
- **Giải đấu**: Tournament management với registration system
- **User Management**: Profile management và role-based access control

## Cấu trúc dự án

```
backend/
├── controllers/          # Business logic
│   ├── authController.js
│   ├── clubController.js
│   ├── bookingController.js
│   ├── tableController.js
│   ├── tournamentController.js
│   └── userController.js
├── models/              # Database schemas
│   ├── User.js
│   ├── Club.js
│   ├── Table.js
│   ├── Booking.js
│   └── Tournament.js
├── routes/              # API routes
│   ├── auth.js
│   ├── clubs.js
│   ├── bookings.js
│   ├── tables.js
│   ├── tournaments.js
│   └── users.js
├── middleware/          # Middleware functions
│   └── auth.js
├── data/               # Sample data
│   └── sample-data.json
├── scripts/            # Utility scripts
│   └── import-data.js
├── server.js           # Main application file
├── package.json
├── config.env
└── README.md
```

## Cài đặt

1. **Clone repository và cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Cấu hình môi trường:**
- Copy `config.env` và cập nhật các biến môi trường:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/billiards_db
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. **Khởi động MongoDB:**
```bash
# Đảm bảo MongoDB đang chạy
mongod
```

4. **Import sample data:**
```bash
node scripts/import-data.js
```

5. **Khởi động server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Clubs
- `GET /api/clubs` - Lấy danh sách clubs (có filter, search, geospatial)
- `GET /api/clubs/:id` - Lấy chi tiết club
- `POST /api/clubs` - Tạo club (Admin/Club Owner)
- `PUT /api/clubs/:id` - Cập nhật club (Owner/Admin)
- `DELETE /api/clubs/:id` - Xóa club (Owner/Admin)
- `POST /api/clubs/:id/rate` - Đánh giá club

### Tables
- `GET /api/tables/club/:clubId` - Lấy bàn theo club
- `GET /api/tables/:id` - Lấy chi tiết bàn
- `POST /api/tables` - Tạo bàn (Admin/Club Owner)
- `PUT /api/tables/:id` - Cập nhật bàn (Owner/Admin)
- `DELETE /api/tables/:id` - Xóa bàn (Owner/Admin)
- `PUT /api/tables/:id/status` - Cập nhật trạng thái bàn

### Bookings
- `POST /api/bookings` - Tạo booking
- `GET /api/bookings` - Lấy booking của user
- `GET /api/bookings/:id` - Lấy chi tiết booking
- `PUT /api/bookings/:id/status` - Cập nhật trạng thái booking
- `PUT /api/bookings/:id/cancel` - Hủy booking
- `GET /api/bookings/club/:clubId` - Lấy booking theo club (Owner/Admin)

### Tournaments
- `GET /api/tournaments` - Lấy danh sách tournaments
- `GET /api/tournaments/:id` - Lấy chi tiết tournament
- `POST /api/tournaments` - Tạo tournament (Admin/Club Owner)
- `PUT /api/tournaments/:id` - Cập nhật tournament (Owner/Admin)
- `DELETE /api/tournaments/:id` - Xóa tournament (Owner/Admin)
- `POST /api/tournaments/:id/register` - Đăng ký tournament
- `DELETE /api/tournaments/:id/unregister` - Hủy đăng ký tournament

### Users
- `GET /api/users/profile` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/bookings` - Lấy booking của user
- `GET /api/users/tournaments` - Lấy tournament của user
- `GET /api/users` - Lấy danh sách users (Admin)
- `GET /api/users/:id` - Lấy chi tiết user (Admin)
- `PUT /api/users/:id` - Cập nhật user (Admin)
- `DELETE /api/users/:id` - Xóa user (Admin)

## Authentication

API sử dụng JWT token cho authentication. Để truy cập các protected routes:

```bash
# Thêm header Authorization
Authorization: Bearer <your_jwt_token>
```

## Roles & Permissions

- **user**: Người dùng thường, có thể đặt bàn, đăng ký tournament
- **club_owner**: Chủ quán, có thể quản lý club, tables, tournaments
- **admin**: Admin hệ thống, có tất cả quyền

## Database Schema

### User
- name, email, password, phone, avatar
- role: user/club_owner/admin
- isActive, lastLogin

### Club
- name, address, phone, email, description
- images, rating, totalRatings, pricePerHour
- openingHours, location (geospatial), amenities
- owner (ref: User)

### Table
- number, type (Standard/VIP/Tournament)
- status (available/occupied/maintenance/reserved)
- club (ref: Club), pricePerHour, features
- currentBooking (ref: Booking)

### Booking
- user, club, table (refs)
- startTime, endTime, duration, totalPrice
- bookingType (hourly/combo), comboDetails
- status, paymentStatus, paymentMethod
- notes, cancellationReason

### Tournament
- name, description, club (ref: Club)
- startDate, endDate, startTime
- maxParticipants, currentParticipants
- entryFee, prizePool, prizes
- status, tournamentType, rules
- organizer (ref: User), participants

## Sample Data

File `data/sample-data.json` chứa dữ liệu mẫu với:
- 5 users (2 regular users, 2 club owners, 1 admin)
- 4 clubs với đầy đủ thông tin
- 12 tables phân bố cho các clubs
- 4 tournaments với các trạng thái khác nhau
- 3 bookings mẫu

### Tài khoản mẫu để test:

**Regular Users:**
- Email: `nguyenvanan@example.com` | Password: `123456`
- Email: `tranthibinh@example.com` | Password: `123456`

**Club Owners:**
- Email: `levancuong@example.com` | Password: `123456`
- Email: `phamthidung@example.com` | Password: `123456`

**Admin:**
- Email: `admin@billiards.com` | Password: `admin123`

## Development

### Scripts
```bash
npm run dev          # Khởi động với nodemon
npm start           # Khởi động production
npm test           # Chạy tests
```

### Environment Variables
- `PORT`: Port server (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key cho JWT
- `NODE_ENV`: Environment (development/production)

## Security Features

- **Note**: Password không được mã hóa để dễ dàng testing
- JWT token authentication
- Role-based access control
- Input validation với express-validator
- Rate limiting
- CORS configuration
- Helmet security headers

## Error Handling

API trả về consistent error format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Pagination

Các endpoints list hỗ trợ pagination:
```bash
GET /api/clubs?page=1&limit=10
```

Response format:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Geospatial Queries

Clubs có geospatial index để tìm kiếm theo vị trí:
```bash
GET /api/clubs?latitude=10.7769&longitude=106.6983&radius=10
```

## Testing

```bash
# Chạy tests
npm test

# Chạy tests với coverage
npm run test:coverage
```

## Deployment

1. Cấu hình production environment
2. Set NODE_ENV=production
3. Cấu hình MongoDB Atlas hoặc production MongoDB
4. Deploy lên server hoặc cloud platform

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License 