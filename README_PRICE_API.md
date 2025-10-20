# Price Management API Setup

## 🎯 Tình trạng hiện tại

Price Management đã được tích hợp với 2 chế độ:

### ✅ Chế độ 1: Mock Data (Không cần Python Server)
- Mở trực tiếp file `admin.html` trong browser
- Tự động hiển thị dữ liệu mẫu (mock data)
- ⚠️ Dữ liệu không thật, chỉ để demo UI

### 🚀 Chế độ 2: Real API (Cần Python Server)
- Chạy server Python để bypass CORS
- Dữ liệu thật từ database
- ✅ Khuyến nghị dùng khi develop/deploy

---

## 📋 Cách sử dụng

### Option 1: Xem nhanh với Mock Data (Không cần setup)

1. Mở file `admin.html` trực tiếp trong browser
2. Click "Price Management" trong menu
3. Sẽ thấy thông báo: "Using mock data"
4. Xem được UI và test các tính năng

### Option 2: Dùng API thật (Cần Python)

1. **Cài Python** (nếu chưa có):
   - Download: https://www.python.org/downloads/
   - ✅ Check "Add Python to PATH" khi cài

2. **Chạy server**:
   ```bash
   python start_server.py
   ```
   hoặc
   ```bash
   python3 start_server.py
   ```

3. **Truy cập**:
   - Server tự động mở browser tại: http://localhost:3000/admin.html
   - Price API: http://localhost:3000/api/pricetable

4. **Kiểm tra**:
   - Thông báo sẽ hiển thị: "✅ Loaded X price records from API!"
   - Không còn cảnh báo "Using mock data"

---

## 🔧 Kiểm tra API

### Test API trực tiếp:
```powershell
Invoke-WebRequest -Uri "https://swp391.up.railway.app/api/pricetable" -Method GET
```

### Kết quả mong đợi:
```json
[
  {
    "id": 1,
    "pricePerKWh": 3858,
    "penaltyFeePerMinute": 1000,
    "validFrom": "2024-03-19T00:00:00",
    "validTo": "2025-12-31T00:00:00",
    "status": 0
  }
]
```

---

## 🎨 Các tính năng đã implement

✅ Hiển thị danh sách bảng giá từ API  
✅ Phân biệt status: Active (1) / Deactive (0)  
✅ Detect expired prices (so sánh validTo với ngày hiện tại)  
✅ Không cho edit prices đã hết hạn  
✅ Activate/Deactivate prices  
✅ Tự động deactivate price cũ khi activate price mới  
✅ Refresh data từ API  
✅ Fallback to mock data khi API không available  

---

## ⚠️ Lưu ý về CORS

API của bạn **không hỗ trợ CORS** từ browser, nên:
- ❌ Không gọi trực tiếp từ file:/// 
- ❌ Không gọi từ domain khác
- ✅ Phải dùng Python proxy server
- ✅ Hoặc dùng mock data để demo

---

## 📞 Troubleshooting

### Lỗi: "Cannot connect to API server"
**Nguyên nhân**: CORS policy  
**Giải pháp**: Chạy Python server hoặc dùng mock data

### Lỗi: "Python was not found"
**Nguyên nhân**: Python chưa cài hoặc chưa add to PATH  
**Giải pháp**: 
1. Cài Python từ python.org
2. Hoặc dùng mock data (không cần Python)

### Mock data không hiển thị
**Giải pháp**: 
1. Check console (F12) xem có lỗi không
2. Refresh trang
3. Clear cache và reload

---

## 🚀 Deploy Production

Khi deploy lên server thật:
1. Backend cần enable CORS headers
2. Hoặc frontend và backend cùng domain
3. Update API URL trong code nếu cần

---

**Created**: October 13, 2025  
**Status**: ✅ Working with mock data, ⚠️ Needs Python for real API
