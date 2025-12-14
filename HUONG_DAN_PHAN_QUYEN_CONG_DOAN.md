# HƯỚNG DẪN ÁP DỤNG PHÂN QUYỀN THEO CỘNG ĐOÀN

## TÓM TẮT

Hệ thống đã có đầy đủ infrastructure để phân quyền theo cộng đoàn. Bạn chỉ cần:

1. Chạy migration để thêm cột data_scope
2. Áp dụng middleware vào routes
3. Sử dụng scopeHelper trong controllers

## BƯỚC 1: CHẠY MIGRATION

```bash
cd backend
mysql -u root -p hoi_dong_osp < db/migrations/add_data_scope_to_users.sql
```

Hoặc copy nội dung file và chạy trong MySQL Workbench/phpMyAdmin

## BƯỚC 2: TẠO MODEL UserCommunityModel (Nếu chưa có)

Tạo file `backend/src/models/UserCommunityModel.js`:

```javascript
const BaseModel = require("./BaseModel");

class UserCommunityModel extends BaseModel {
  constructor() {
    super({ tableName: "user_communities", primaryKey: "id" });
  }

  /**
   * Get community IDs for a user
   */
  async getUserCommunityIds(userId) {
    const query = `SELECT community_id FROM ${this.tableName} WHERE user_id = ?`;
    const rows = await this.executeQuery(query, [userId]);
    return rows.map((row) => row.community_id);
  }

  /**
   * Assign communities to user
   */
  async assignCommunities(userId, communityIds, grantedBy) {
    // Delete existing
    await this.executeQuery(`DELETE FROM ${this.tableName} WHERE user_id = ?`, [
      userId,
    ]);

    // Insert new
    if (communityIds.length > 0) {
      const values = communityIds.map((cid) => [userId, cid, grantedBy]);
      await this.executeQuery(
        `INSERT INTO ${this.tableName} (user_id, community_id, granted_by) VALUES ?`,
        [values]
      );
    }

    return true;
  }
}

module.exports = new UserCommunityModel();
```

## BƯỚC 3: CẬP NHẬT ROUTES

Thêm middleware `attachDataScope` vào routes cần phân quyền:

### Ví dụ: sisterRoutes.js

```javascript
const { attachDataScope } = require("../middlewares/dataScope");

// Áp dụng cho tất cả routes
router.use(attachDataScope);

// Hoặc áp dụng cho từng route cụ thể
router.get(
  "/",
  authenticateToken,
  attachDataScope, // <-- Thêm middleware này
  checkPermission("sisters.view_list"),
  sisterController.getAllSisters
);
```

## BƯỚC 4: CẬP NHẬT CONTROLLERS

### Ví dụ: sisterController.js

```javascript
const scopeHelper = require("../utils/scopeHelper");

// GET /api/sisters - Get list
getAllSisters = async (req, res) => {
  try {
    const scope = req.userScope; // <-- Lấy scope từ middleware
    const { search, page = 1, limit = 20 } = req.query;

    // Build base query
    let query = `
      SELECT s.*, c.name as current_community
      FROM sisters s
      LEFT JOIN community_assignments ca ON s.id = ca.sister_id AND ca.end_date IS NULL
      LEFT JOIN communities c ON ca.community_id = c.id
    `;

    const params = [];
    const conditions = [];

    // Add search filter
    if (search) {
      conditions.push("(s.full_name LIKE ? OR s.religious_name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    // ===== ÁP DỤNG SCOPE FILTER =====
    const scopeFilter = scopeHelper.applyScopeFilter(scope, "sisters");

    if (scopeFilter.where) {
      // Nếu cần join, đã có trong query rồi (ca table)
      conditions.push(`(${scopeFilter.where})`);
      params.unshift(...scopeFilter.params); // Add scope params first
    }

    // Build WHERE clause
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Count total
    const countQuery = query.replace(
      /SELECT .+ FROM/,
      "SELECT COUNT(DISTINCT s.id) as total FROM"
    );
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += " ORDER BY s.full_name LIMIT ? OFFSET ?";
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    // Execute query
    const [sisters] = await db.query(query, params);

    res.json({
      success: true,
      data: {
        items: sisters,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getAllSisters error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/sisters/:id - Get detail
getSisterById = async (req, res) => {
  try {
    const { id } = req.params;
    const scope = req.userScope;

    // Get sister
    const query = "SELECT * FROM sisters WHERE id = ?";
    const [sisters] = await db.query(query, [id]);

    if (sisters.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy nữ tu" });
    }

    // ===== KIỂM TRA SCOPE ACCESS =====
    const hasAccess = await scopeHelper.checkScopeAccess(
      scope,
      id,
      "sisters",
      async (sisterId) => {
        // Get sister's current communities
        const [ca] = await db.query(
          "SELECT community_id FROM community_assignments WHERE sister_id = ? AND end_date IS NULL",
          [sisterId]
        );
        return ca.map((row) => row.community_id);
      }
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem thông tin nữ tu này",
      });
    }

    // Return data
    res.json({ success: true, data: sisters[0] });
  } catch (error) {
    console.error("getSisterById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
```

## BƯỚC 5: CẬP NHẬT CÁC CONTROLLER KHÁC

Áp dụng tương tự cho:

### missionController.js

```javascript
// Missions liên kết qua sister_id
const scopeFilter = scopeHelper.applyScopeFilter(scope, "sisters", {
  communityJoinTable: "community_assignments",
  communityJoinColumn: "sister_id",
});

// Thêm JOIN nếu cần
query = `
  SELECT m.*, s.full_name
  FROM missions m
  JOIN sisters s ON m.sister_id = s.id
  LEFT JOIN community_assignments ca ON s.id = ca.sister_id AND ca.end_date IS NULL
`;
```

### educationController.js

```javascript
// Education records liên kết qua sister_id
const scopeFilter = scopeHelper.applyScopeFilter(scope, "sisters");

query = `
  SELECT e.*, s.full_name
  FROM education e
  JOIN sisters s ON e.sister_id = s.id
  LEFT JOIN community_assignments ca ON s.id = ca.sister_id AND ca.end_date IS NULL
`;
```

### reportController.js

```javascript
// Báo cáo theo độ tuổi
getByAge = async (req, res) => {
  const scope = req.userScope;

  let query = `
    SELECT 
      CASE 
        WHEN YEAR(CURDATE()) - YEAR(date_of_birth) < 30 THEN 'Dưới 30'
        WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 30 AND 40 THEN '30-40'
        ...
      END AS age_group,
      COUNT(DISTINCT s.id) as count
    FROM sisters s
    LEFT JOIN community_assignments ca ON s.id = ca.sister_id AND ca.end_date IS NULL
  `;

  // Áp dụng scope
  const scopeFilter = scopeHelper.applyScopeFilter(scope, "sisters");
  if (scopeFilter.where) {
    query += ` WHERE ${scopeFilter.where}`;
  }

  query += " GROUP BY age_group";

  const [results] = await db.query(query, scopeFilter.params);
  // ...
};
```

## BƯỚC 6: TEST

### Test với user có scope 'all' (admin)

```bash
# Login as admin
POST http://localhost:5000/api/auth/login
{ "username": "admin", "password": "admin123" }

# Get sisters (should see all)
GET http://localhost:5000/api/sisters
Authorization: Bearer <token>
```

### Test với user có scope 'community'

```bash
# Tạo user test
INSERT INTO users (username, password, email, full_name, data_scope)
VALUES ('test_community', '<hashed_password>', 'test@example.com', 'Test User', 'community');

# Gán cộng đoàn
INSERT INTO user_communities (user_id, community_id, granted_by)
VALUES (23, 1, 1), (23, 2, 1);

# Login as test user
POST http://localhost:5000/api/auth/login
{ "username": "test_community", "password": "test123" }

# Get sisters (should only see sisters from communities 1 and 2)
GET http://localhost:5000/api/sisters
Authorization: Bearer <token>
```

## BƯỚC 7: KIỂM TRA DATABASE

```sql
-- Kiểm tra users có data_scope
SELECT id, username, is_admin, data_scope, is_super_admin
FROM users;

-- Kiểm tra user_communities
SELECT uc.*, u.username, c.name
FROM user_communities uc
JOIN users u ON uc.user_id = u.id
JOIN communities c ON uc.community_id = c.id;

-- Kiểm tra sisters theo cộng đoàn
SELECT s.id, s.full_name, c.name as community
FROM sisters s
JOIN community_assignments ca ON s.id = ca.sister_id
JOIN communities c ON ca.community_id = c.id
WHERE ca.end_date IS NULL
ORDER BY c.name, s.full_name;
```

## BƯỚC 8: CẬP NHẬT FRONTEND (Không cần thay đổi nhiều)

Frontend không cần thay đổi logic vì:

- Backend tự động filter dữ liệu theo scope
- API sẽ trả về 403 nếu user cố truy cập dữ liệu ngoài scope
- Chỉ cần xử lý error messages cho user thân thiện

```javascript
// Example: Handle 403 in frontend
try {
  const response = await sisterService.getById(id);
  // ...
} catch (error) {
  if (error.response?.status === 403) {
    toast.error("Bạn không có quyền xem thông tin này");
    navigate("/sisters");
  }
}
```

## LƯU Ý QUAN TRỌNG

1. **Performance**: Queries với scope filter có thể chậm hơn

   - Đảm bảo có indexes trên: `community_assignments.community_id`, `community_assignments.sister_id`, `community_assignments.end_date`
   - Cache scope information (đã có trong middleware)

2. **Testing**: Test kỹ với nhiều scenarios

   - User không có cộng đoàn → Không thấy gì
   - User có 1 cộng đoàn → Chỉ thấy data cộng đoàn đó
   - User có nhiều cộng đoàn → Thấy data tất cả các cộng đoàn đó
   - Admin → Thấy tất cả

3. **Audit Log**: Khi admin thay đổi community assignment

   - Clear cache: `clearScopeCache(userId)`
   - Log thay đổi để audit

4. **Data Migration**: Nếu có data cũ
   - Gán tất cả nữ tu vào cộng đoàn mặc định
   - Gán user vào cộng đoàn thích hợp

## CHECKLIST

- [ ] Chạy migration add_data_scope_to_users.sql
- [ ] Tạo UserCommunityModel.js
- [ ] Cập nhật sisterRoutes.js - Thêm attachDataScope middleware
- [ ] Cập nhật sisterController.js - Áp dụng scope filter
- [ ] Test với admin user
- [ ] Tạo test user với community scope
- [ ] Gán test user vào 1-2 cộng đoàn
- [ ] Test xem chỉ thấy data của cộng đoàn được gán
- [ ] Áp dụng cho missionController.js
- [ ] Áp dụng cho educationController.js
- [ ] Áp dụng cho reportController.js
- [ ] Test toàn bộ hệ thống

## HỖ TRỢ

Nếu gặp vấn đề:

1. Check logs: `console.error` trong middleware và controllers
2. Check queries: Log SQL queries trước khi execute
3. Check scope object: `console.log(req.userScope)`
4. Verify database: Check user_communities table có dữ liệu chưa
