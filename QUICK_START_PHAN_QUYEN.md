# QUICK START - Phân Quyền Cộng Đoàn

## BƯỚC 1: Chạy Migration (5 phút)

```bash
cd backend
node src/scripts/test_data_scope.js
```

Nếu thấy "Column 'data_scope' not found", chạy:

```bash
# Windows
type db\migrations\add_data_scope_to_users.sql | mysql -u root -p hoi_dong_osp

# Linux/Mac
mysql -u root -p hoi_dong_osp < db/migrations/add_data_scope_to_users.sql
```

## BƯỚC 2: Tạo Test User (2 phút)

Chạy trong MySQL:

```sql
-- Tạo user test với password: test123
INSERT INTO users (username, password, email, full_name, data_scope)
VALUES ('test_community', '$2a$10$K7GlQYYr.VwH7eG.DqxF3OvK7tHZTZhN9KXd5QKvI6.tXLN4tHZwu',
        'test@example.com', 'Test Community User', 'community');

-- Gán user vào cộng đoàn (thay 1,2 bằng ID cộng đoàn thực tế)
SET @test_user_id = LAST_INSERT_ID();
INSERT INTO user_communities (user_id, community_id, granted_by)
VALUES (@test_user_id, 1, 1), (@test_user_id, 2, 1);
```

## BƯỚC 3: Cập Nhật 1 Route Để Test (10 phút)

File: `backend/src/routes/sisterRoutes.js`

```javascript
const { attachDataScope } = require("../middlewares/dataScope");

// Thêm middleware (chỉ cần 1 dòng)
router.use(attachDataScope);

// Hoặc cho từng route
router.get(
  "/",
  authenticateToken,
  attachDataScope, // <-- Thêm dòng này
  checkPermission("sisters.view_list"),
  sisterController.getAllSisters
);
```

File: `backend/src/controllers/sisterController.js`

```javascript
const scopeHelper = require("../utils/scopeHelper");

getAllSisters = async (req, res) => {
  try {
    const scope = req.userScope; // <-- Lấy scope

    let query = `
      SELECT s.*, c.name as community_name
      FROM sisters s
      LEFT JOIN community_assignments ca ON s.id = ca.sister_id AND ca.end_date IS NULL
      LEFT JOIN communities c ON ca.community_id = c.id
    `;

    const params = [];
    const conditions = [];

    // ===== THÊM 5 DÒNG NÀY =====
    const scopeFilter = scopeHelper.applyScopeFilter(scope, "sisters");
    if (scopeFilter.where) {
      conditions.push(`(${scopeFilter.where})`);
      params.unshift(...scopeFilter.params);
    }
    // ===========================

    // ... rest of the code
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [sisters] = await db.query(query, params);
    res.json({ success: true, data: sisters });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
```

## BƯỚC 4: Test (5 phút)

### Test 1: Login as Admin

```bash
POST http://localhost:5000/api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

Lấy token, gọi:

```bash
GET http://localhost:5000/api/sisters
Authorization: Bearer <admin_token>
```

Kết quả: **Thấy tất cả nữ tu**

### Test 2: Login as Test User

```bash
POST http://localhost:5000/api/auth/login
{
  "username": "test_community",
  "password": "test123"
}
```

Lấy token, gọi:

```bash
GET http://localhost:5000/api/sisters
Authorization: Bearer <test_token>
```

Kết quả: **Chỉ thấy nữ tu của cộng đoàn 1 và 2**

## BƯỚC 5: Áp Dụng Cho Các Module Khác

Copy-paste pattern trên cho:

- missionController.js
- educationController.js
- healthController.js
- evaluationController.js
- reportController.js

## TỔNG THỜI GIAN: ~30 phút

## TROUBLESHOOTING

### Không thấy req.userScope?

- Check middleware đã được thêm vào route chưa
- Check middleware đứng sau `authenticateToken`
- Log: `console.log(req.userScope)` trong controller

### Vẫn thấy tất cả data?

- Check `data_scope` trong database: `SELECT data_scope FROM users WHERE id = ?`
- Check `user_communities` có dữ liệu: `SELECT * FROM user_communities WHERE user_id = ?`
- Log scope filter: `console.log(scopeFilter)`

### Error "community_id IN ()"?

- User không được gán cộng đoàn nào
- Chạy: `INSERT INTO user_communities (user_id, community_id, granted_by) VALUES (?, ?, 1)`

## CHI TIẾT

Xem file đầy đủ: [HUONG_DAN_PHAN_QUYEN_CONG_DOAN.md](./HUONG_DAN_PHAN_QUYEN_CONG_DOAN.md)
