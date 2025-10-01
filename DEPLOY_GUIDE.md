# 🚀 Deploy Flower Shop Backend lên Render

## Bước 1: Chuẩn bị Git Repository

```bash
# Khởi tạo git nếu chưa có
git init

# Add tất cả files
git add .

# Commit
git commit -m "Flower shop backend ready for deployment"

# Tạo repository trên GitHub/GitLab và push
git remote add origin <your-git-repo-url>
git push -u origin master
```

## Bước 2: Tạo Account trên Render

1. Truy cập: https://render.com
2. Sign up với GitHub account
3. Verify email

## Bước 3: Deploy Database trước

1. Vào Dashboard → Click **"New +"** → Chọn **"PostgreSQL"**
2. Điền thông tin:
   - **Name**: `flower-shop-db`
   - **Database**: `medusa_store`
   - **User**: `medusa`
   - **Region**: Singapore (hoặc gần bạn nhất)
   - **Plan**: Free
3. Click **"Create Database"**
4. Đợi database khởi tạo (2-3 phút)
5. **Copy "Internal Database URL"** (sẽ dùng cho bước sau)

## Bước 4: Deploy Backend Service

1. Vào Dashboard → Click **"New +"** → Chọn **"Web Service"**
2. Connect GitHub repository của bạn
3. Điền thông tin:
   - **Name**: `flower-shop-backend`
   - **Region**: Singapore (cùng region với database)
   - **Branch**: `master`
   - **Root Directory**: `.` (để trống)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

4. **Environment Variables** - Click "Advanced" và thêm:

```
NODE_ENV=production

DATABASE_URL=<paste-internal-database-url-từ-bước-3>

JWT_SECRET=<generate-random-string-64-chars>

COOKIE_SECRET=<generate-random-string-64-chars>

STORE_CORS=http://localhost:8000,https://your-storefront-url.vercel.app

ADMIN_CORS=http://localhost:9000,http://localhost:7001

AUTH_CORS=http://localhost:9000
```

5. Click **"Create Web Service"**

## Bước 5: Chạy Database Migrations

Sau khi deploy xong (5-10 phút):

1. Vào service vừa tạo
2. Click tab **"Shell"**
3. Chạy lệnh:
```bash
npm run db:migrate
npm run seed
```

## Bước 6: Test Backend

URL của bạn sẽ là: `https://flower-shop-backend.onrender.com`

Test:
```bash
curl https://flower-shop-backend.onrender.com/health
# Response: "OK"
```

## Bước 7: Cập nhật CORS

Sau khi có URL backend, cập nhật environment variables:

```
STORE_CORS=https://flower-shop-backend.onrender.com,https://your-storefront.vercel.app
ADMIN_CORS=https://flower-shop-backend.onrender.com
```

## 🎉 Hoàn thành!

Backend URL: `https://flower-shop-backend.onrender.com`
Admin Dashboard: `https://flower-shop-backend.onrender.com/app`

## ⚠️ Lưu ý về Free Plan

- Service sẽ **sleep sau 15 phút không hoạt động**
- Request đầu tiên sau khi sleep sẽ mất 30-50s để wake up
- Database giới hạn 1GB storage
- Upgrade lên paid plan ($7/month) để:
  - Không bị sleep
  - Nhiều storage hơn
  - Performance tốt hơn

## 🔥 Tips

1. **Generate JWT/COOKIE secrets**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Monitor logs**:
   - Vào service → Tab "Logs" để xem real-time logs

3. **Auto-deploy**:
   - Mỗi khi push code lên GitHub, Render sẽ tự động deploy

## Next Steps: Deploy Storefront

Sau khi backend chạy tốt, deploy storefront (Next.js) lên Vercel:

1. Tạo Next.js storefront với Medusa starter
2. Cấu hình `NEXT_PUBLIC_MEDUSA_BACKEND_URL` = backend URL trên Render
3. Deploy lên Vercel
4. Cập nhật CORS trên backend với storefront URL 