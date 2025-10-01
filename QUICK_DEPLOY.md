# 🚀 Quick Deploy với Render CLI

## ✅ Đã hoàn thành:
- ✅ Render CLI đã cài đặt
- ✅ PostgreSQL database đã tạo
- ✅ Code đã commit
- ✅ render.yaml đã cấu hình

## 📝 Các bước tiếp theo:

### 1. Hoàn thành login (nếu chưa)
Browser sẽ tự mở, click "Generate token" để xác nhận.

### 2. Push code lên GitHub/GitLab

Nếu chưa có remote repository:

```bash
# Tạo repo mới trên GitHub, sau đó:
git remote add origin https://github.com/your-username/flower-shop-backend.git
git push -u origin master
```

### 3. Deploy bằng Render CLI

**Option A: Deploy từ Blueprint (render.yaml)**

```bash
# Set workspace (chọn workspace của bạn)
render workspace set

# Deploy từ render.yaml
render blueprint launch
```

**Option B: Deploy manual qua Dashboard**

1. Vào https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Các settings sẽ tự động load từ `render.yaml`
5. Click "Create Web Service"

### 4. Chạy migrations sau khi deploy xong

```bash
# List services
render services

# Open shell vào service
render ssh [SERVICE-ID]

# Trong shell, chạy:
npm run db:migrate
npm run seed
```

Hoặc dùng psql để migrate:

```bash
# Connect vào database
render psql dpg-d3ecdp2li9vc739i5av0-a

# Trong psql session, exit rồi chạy migrate từ local:
# (migrate sẽ tự chạy khi service start lần đầu)
```

### 5. Test Backend

Sau khi deploy xong, URL sẽ có dạng:
```
https://flower-shop-backend.onrender.com
```

Test:
```bash
curl https://flower-shop-backend.onrender.com/health
# Response: "OK"
```

Admin Dashboard:
```
https://flower-shop-backend.onrender.com/app
```

### 6. Cập nhật CORS (sau khi có URL)

Vào Render Dashboard → Service → Environment → Edit

Cập nhật:
```
STORE_CORS=https://flower-shop-backend.onrender.com,https://your-storefront.vercel.app
ADMIN_CORS=https://flower-shop-backend.onrender.com
AUTH_CORS=https://flower-shop-backend.onrender.com
```

## 🎯 Database Connection String đã dùng:

```
postgresql://medusa:4pUuGooEsJtJ6joEQArKwEPQXEVpqfx1@dpg-d3ecdp2li9vc739i5av0-a.singapore-postgres.render.com/medusa_store_ia4y
```

## 📊 Theo dõi Deploy:

```bash
# List deploys
render deploys list [SERVICE-ID]

# View logs
render logs [SERVICE-ID] --tail
```

## ⚠️ Lưu ý Free Plan:

- Service sleep sau 15 phút không hoạt động
- Request đầu tiên sau sleep: ~30-50s để wake up
- Database: 1GB storage limit
- Upgrade sang Starter plan ($7/month) để không bị sleep

## 🎉 Hoàn thành!

Sau khi deploy xong, bạn sẽ có:
- ✅ Flower Shop Backend running trên Render
- ✅ PostgreSQL database với flower shop data
- ✅ Admin Dashboard accessible
- ✅ Ready để connect với storefront 