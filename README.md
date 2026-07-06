# BE_NOEL_2025

## Hướng dẫn setup dự án

### 1. Cài đặt dependencies

```sh
yarn install
```

### 2. Setup database (MySQL)

- Dự án sử dụng **MySQL** làm database.
- Cài đặt MySQL trên máy (nếu chưa có):
  - Mac: `brew install mysql`
  - Ubuntu: `sudo apt install mysql-server`
  - Windows: tải từ https://dev.mysql.com/downloads/installer/
- Tạo database mới:
  ```sh
  mysql -u root -p
  CREATE DATABASE mini_games_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- Cấu hình kết nối database trong file `.env` (tạo file `.env` ở thư mục gốc nếu chưa có):
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_USERNAME=root
  DB_PASSWORD=your_password
  DB_DATABASE=mini_games_db
  ```

### 3. Cấu hình môi trường (env)

- Sử dụng [dotenv-flow](https://www.npmjs.com/package/dotenv-flow) để tự động load biến môi trường theo NODE_ENV.
- Tạo các file env cho từng môi trường:
  - `.env` (mặc định local)
  - `.env.development`
  - `.env.production`
  - `.env.staging` (nếu cần)
  - `.env.test` (nếu cần)
- Khi chạy app, dotenv-flow sẽ tự động chọn file env phù hợp dựa vào NODE_ENV.

### 4. Chạy app với các môi trường khác nhau

#### **Chạy bằng yarn/npm**

- **Mặc định (sử dụng `.env`):**
  ```sh
  yarn start:dev
  ```
- **Chạy development (sử dụng `.env.development`):**
  ```sh
  NODE_ENV=development yarn start:dev
  ```
- **Chạy production (sử dụng `.env.production`):**
  ```sh
  NODE_ENV=production yarn start:prod
  ```
- **Chạy staging (nếu có `.env.staging`):**
  ```sh
  NODE_ENV=staging yarn start
  ```

### 5. Cấu hình code style & kiểm tra code

- Dự án sử dụng **ESLint** để kiểm tra quy tắc code (code quality, best practice, lỗi logic, style JS/TS).
- Sử dụng **Prettier** để format code tự động (dấu cách, xuống dòng, căn lề, ...).
- **Husky** tự động kiểm tra code trước khi commit (pre-commit hook).

### 6. Format code

- Để format toàn bộ code, bạn có thể dùng một trong các cách sau:
  ```sh
  npx prettier --write .
  # hoặc
  yarn prettier --write .
  # hoặc
  yarn format
  ```
- (Đã có sẵn script "format" trong package.json: `"format": "prettier --write ."`)
- Hoặc dùng Prettier extension trong VSCode để tự động format khi lưu file.

### 7. Kiểm tra code trước khi commit

- Khi commit, Husky sẽ tự động chạy:
  - `npx prettier --check .` để kiểm tra format
  - `npx eslint "{src,apps,libs,test}/**/*.ts"` để kiểm tra quy tắc code
- Nếu có lỗi, bạn cần sửa hoặc chạy:
  ```sh
  yarn format
  yarn lint
  ```
  để tự động sửa lỗi trước khi commit lại.

### 8. Quy chuẩn code

- **Không dùng `any`** trong TypeScript.
- **Không dùng `console.log`** trong code production.
- **Luôn dùng `const` nếu biến không thay đổi.**
- **Không để biến không sử dụng.**
- **Luôn format code trước khi push.**
- **Luôn viết type/interface rõ ràng cho dữ liệu.**

### 9. Một số lệnh hữu ích

- Format code: `yarn format` hoặc `npx prettier --write .`
- Kiểm tra code: `yarn lint`
- Build: `yarn build`
- Start dev: `yarn start:dev`

---

## Quy trình push code chuẩn

1. **Pull code mới nhất về:**
   ```sh
   git pull origin main
   ```
2. **Code và commit như bình thường.**
3. **Khi commit, Husky sẽ kiểm tra code tự động. Nếu có lỗi, sửa lại cho đúng chuẩn.**
4. **Push code lên remote:**
   ```sh
   git push origin <branch>
   ```

---
