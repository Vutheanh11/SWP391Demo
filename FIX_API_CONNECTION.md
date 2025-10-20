# 🔧 Hướng dẫn Fix lỗi API Connection

## ❌ Vấn đề: "Error loading price data - Failed to fetch"

Lỗi này xảy ra khi bạn mở file HTML **trực tiếp** từ File Explorer (protocol `file:///`).

Browser block CORS requests từ `file://` protocol vì lý do bảo mật.

---

## ✅ Giải pháp: Chạy qua HTTP Server

### Option 1: VS Code Live Server (KHUYÊN DÙNG) ⭐

1. **Cài extension "Live Server"**
   - Mở VS Code
   - Vào Extensions (Ctrl+Shift+X)
   - Tìm "Live Server" by Ritwick Dey
   - Click Install

2. **Chạy server**
   - Right-click vào `index.html`
   - Chọn "Open with Live Server"
   - Browser sẽ tự mở: `http://127.0.0.1:5500/index.html`

3. **Login và test**
   - Email: `demo@electromove.com`
   - Password: `demo123`
   - Vào "Price Management" → API sẽ hoạt động! ✅

---

### Option 2: Python HTTP Server

```bash
# Trong folder Web_SWP391
python -m http.server 8000

# Hoặc với Python 2
python -m SimpleHTTPServer 8000
```

Sau đó mở: `http://localhost:8000/index.html`

---

### Option 3: Node.js HTTP Server

```bash
# Cài (chỉ lần đầu)
npm install -g http-server

# Chạy
npx http-server

# Hoặc
http-server
```

Mở: `http://localhost:8080/index.html`

---

### Option 4: PHP Built-in Server

```bash
php -S localhost:8000
```

Mở: `http://localhost:8000/index.html`

---

## 🧪 Debug Tools

Tôi đã tạo 2 file để test API:

### 1. `debug-api.html` - Advanced Debug Tool
- Mở file này qua HTTP server
- Chạy các test tự động
- Xem logs chi tiết
- Kiểm tra CORS headers

### 2. `test-api.html` - Simple API Tester
- Test cơ bản
- Hiển thị response data

---

## 📋 Checklist

- [ ] Đã cài Live Server extension
- [ ] Chạy "Open with Live Server" 
- [ ] URL hiển thị `http://127.0.0.1:5500/...` (KHÔNG phải `file:///...`)
- [ ] Login vào admin dashboard
- [ ] Vào "Price Management"
- [ ] Thấy data load từ API ✅

---

## 🔍 Cách kiểm tra đang chạy đúng

### ❌ SAI (sẽ bị lỗi CORS):
```
file:///D:/Semester5/SWP391/Web_SWP391/index.html
```

### ✅ ĐÚNG:
```
http://127.0.0.1:5500/index.html
http://localhost:8000/index.html
http://localhost:5500/index.html
```

---

## 🆘 Vẫn lỗi?

1. **Mở Browser Console (F12)**
   - Xem tab Console
   - Check có lỗi CORS không
   - Screenshot và báo lại

2. **Test API trực tiếp**
   - Mở: `http://localhost:5500/debug-api.html`
   - Click "Full API Test"
   - Xem kết quả

3. **Kiểm tra Network**
   - F12 → Tab Network
   - Reload page
   - Click vào request "pricetable"
   - Xem Response

---

## 📊 API Endpoint

```
GET https://swp391.up.railway.app/api/pricetable
```

Response format:
```json
[
  {
    "id": 1,
    "pricePerKWh": 3500,
    "penaltyFeePerMinute": 800,
    "validFrom": "2023-01-01T00:00:00",
    "validTo": "2024-03-18T00:00:00",
    "status": 1
  }
]
```

---

## 🎯 Tóm tắt

**Vấn đề:** Browser block CORS từ `file://` protocol

**Giải pháp:** Chạy qua HTTP server (Live Server)

**Kết quả:** API hoạt động hoàn hảo! 🎉

---

Made with ❤️ for ElectroMove Admin Dashboard
