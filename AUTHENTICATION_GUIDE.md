# 🔒 Authentication System Guide

## Overview
Hệ thống authentication đã được thêm vào để bảo vệ trang admin dashboard. Người dùng phải login trước khi có thể truy cập và load API data.

## Features

### ✅ Login Protection
- Admin dashboard kiểm tra authentication trước khi load bất kỳ data nào
- Nếu chưa login, sẽ hiển thị thông báo và redirect về trang login
- Tất cả API calls chỉ được thực hiện sau khi verify user đã login

### ✅ Session Management
- Sử dụng `sessionStorage` để lưu trạng thái login
- Session data bao gồm:
  - `isLoggedIn`: 'true' khi user đã login
  - `userEmail`: Email của user
  - `loginTime`: Thời gian login

### ✅ Logout Functionality
- Clear toàn bộ session data khi logout
- Redirect về trang login
- Hiển thị notification

## Test Accounts

```javascript
Email: demo@electromove.com
Password: demo123

Email: user@test.com
Password: password

Email: minhduc@gmail.com
Password: 123456789
```

## Code Flow

### 1. Login Process (login.js)
```javascript
// When login successful:
sessionStorage.setItem('isLoggedIn', 'true');
sessionStorage.setItem('userEmail', email);
sessionStorage.setItem('loginTime', new Date().toISOString());
```

### 2. Authentication Check (admin.js)
```javascript
// On page load:
function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login
        window.location.href = 'login.html';
        return false;
    }
    
    return true; // Allow dashboard initialization
}
```

### 3. Logout (admin.js)
```javascript
// Clear session and redirect
sessionStorage.clear();
window.location.href = 'login.html';
```

## Testing Instructions

### Test 1: Unauthorized Access
1. Đảm bảo bạn đã logout hoặc mở incognito window
2. Truy cập trực tiếp: `http://localhost:3000/admin.html`
3. **Expected**: Hiển thị "Authentication Required" và redirect về login.html
4. **Verify**: Không có API calls được thực hiện (check Network tab)

### Test 2: Successful Login
1. Mở `http://localhost:3000/login.html`
2. Login với: `demo@electromove.com` / `demo123`
3. **Expected**: Redirect về admin.html và load tất cả data
4. **Verify**: 
   - Session storage có `isLoggedIn = 'true'`
   - API calls được thực hiện
   - Dashboard hiển thị đầy đủ data

### Test 3: Session Persistence
1. Login thành công
2. Navigate giữa các sections trong dashboard
3. Refresh page (F5)
4. **Expected**: Vẫn ở trang admin, không bị redirect
5. **Verify**: Session data vẫn còn

### Test 4: Logout
1. Login thành công
2. Click nút Logout
3. Confirm logout
4. **Expected**: 
   - Hiển thị "Logged out successfully"
   - Redirect về login.html
   - Session storage bị clear
5. **Verify**: Không thể quay lại admin.html mà không login lại

### Test 5: Multiple Tabs
1. Login trong tab 1
2. Mở tab 2 với `admin.html`
3. **Expected**: Tab 2 có thể access dashboard (same session)
4. Logout ở tab 1
5. Refresh tab 2
6. **Expected**: Tab 2 bị redirect về login

## Security Features

### ✅ Implemented
- [x] Session-based authentication
- [x] Automatic redirect khi chưa login
- [x] Clear session khi logout
- [x] Prevent API calls khi unauthorized

### 🔄 Future Enhancements (Optional)
- [ ] Session timeout (auto logout after X minutes)
- [ ] JWT token-based authentication
- [ ] Role-based access control (admin, user, viewer)
- [ ] Remember me with secure token
- [ ] API request authentication headers
- [ ] CSRF protection

## Files Modified

1. **js/admin.js**
   - Added `checkAuthentication()` function
   - Added `showAuthenticationError()` function
   - Added `updateUserInfo()` function
   - Updated logout to clear session

2. **js/login.js**
   - Added session storage on successful login
   - Store `isLoggedIn`, `userEmail`, `loginTime`

## Browser Console Testing

```javascript
// Check current session
console.log('Session:', {
    isLoggedIn: sessionStorage.getItem('isLoggedIn'),
    userEmail: sessionStorage.getItem('userEmail'),
    loginTime: sessionStorage.getItem('loginTime')
});

// Manual login (for testing)
sessionStorage.setItem('isLoggedIn', 'true');
sessionStorage.setItem('userEmail', 'test@example.com');
location.reload();

// Manual logout (for testing)
sessionStorage.clear();
location.reload();
```

## Troubleshooting

### Issue: Still redirecting after login
**Solution**: Check browser console for errors. Verify sessionStorage is not disabled.

### Issue: Can access admin without login
**Solution**: 
1. Clear browser cache
2. Hard refresh (Ctrl + F5)
3. Check if `checkAuthentication()` is being called in console

### Issue: Logout doesn't work
**Solution**: Check if sessionStorage.clear() is executed. Open DevTools > Application > Session Storage

## Notes

- Session storage is cleared when browser tab is closed
- Local storage persists even after closing browser (used for "Remember Me")
- For production, use secure HTTP-only cookies or JWT tokens
- Consider adding session timeout for security

---

**Status**: ✅ Authentication system implemented and ready for testing
**Last Updated**: October 14, 2025
