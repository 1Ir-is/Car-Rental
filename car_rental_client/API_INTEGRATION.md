# API Integration Documentation

## 🎯 Overview

This document describes the integration between the React frontend and Spring Boot backend for user profile management.

## 📋 Backend API Endpoints

### GET /api/user/me

- **Purpose**: Get current user profile
- **Method**: GET
- **Authentication**: HttpOnly cookies
- **Response**: User profile data

```java
@GetMapping("/me")
public ResponseEntity<UserProfileDTO> getCurrentUser(HttpServletRequest request) {
    // Implementation in UserController
}
```

### PUT /api/user/me

- **Purpose**: Update user profile
- **Method**: PUT
- **Authentication**: HttpOnly cookies
- **Body**: UserProfileDTO
- **Response**: Updated user profile data

```java
@PutMapping("/me")
public ResponseEntity<UserProfileDTO> updateUserProfile(@RequestBody UserProfileDTO userProfileDTO, HttpServletRequest request) {
    // Implementation in UserController
}
```

## 🔧 Frontend Integration

### AuthService Functions

```javascript
// Get current user profile
const getCurrentUserProfile = async () => {
  try {
    const response = await API.get("/user/me");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get user profile",
    };
  }
};

// Update user profile
const updateUserProfile = async (userData) => {
  try {
    const response = await API.put("/user/me", userData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile",
    };
  }
};
```

### AuthContext Integration

The `AuthContext` provides these functions:

- `updateUser(userData)` - Update user profile and sync local state
- `getCurrentUserProfile()` - Fetch fresh user data from backend

### Usage in Components

```jsx
// In Profile.jsx
const { user, updateUser } = useAuth();

const handleSubmit = async (formData) => {
  const result = await updateUser(formData);
  if (result.success) {
    toast.success("Profile updated successfully!");
  } else {
    toast.error(result.message);
  }
};
```

## 🔒 Authentication Flow

1. **Login**: User authenticates and receives HttpOnly cookies
2. **API Calls**: Axios automatically includes cookies in requests
3. **Profile Operations**: Backend validates cookies and returns user-specific data

## 🧪 Testing

### Automated Testing

- Run the app and navigate to `/api-test.html`
- Use the test interface to verify API integration
- Check browser console for detailed logs

### Manual Testing

1. Login to the application
2. Go to Profile page
3. Update profile information
4. Verify changes are saved and reflected in UI
5. Check trust points are displayed correctly

## 📊 Data Flow

```
Profile.jsx → updateUser() → authService.updateUserProfile() → PUT /api/user/me → Backend → Updated User Data → AuthContext → UI Update
```

## 🚨 Error Handling

### Frontend Error Handling

- Network errors: "Network error. Please check your connection."
- 401 Unauthorized: Automatic logout and redirect to login
- 400 Bad Request: Display validation errors
- 500+ Server errors: "Server error. Please try again later."

### Backend Error Handling

- Input validation errors
- Authentication failures
- Database errors
- Business logic violations

## ⚡ Performance Optimizations

1. **Debounced Updates**: Prevent rapid successive API calls
2. **Loading States**: Show spinners during API operations
3. **Error Recovery**: Retry mechanisms for failed requests
4. **Caching**: Local state management reduces unnecessary API calls

## 🔧 Configuration

### Axios Configuration

```javascript
const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // Essential for HttpOnly cookies
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### CORS Configuration (Backend)

```java
@CrossOrigin(
  origins = {"http://localhost:3000"},
  allowCredentials = true,
  methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}
)
```

## 📋 Troubleshooting

### Common Issues

1. **Cookies not being sent**

   - Ensure `withCredentials: true` in Axios config
   - Check CORS `allowCredentials = true` on backend

2. **401 Unauthorized errors**

   - Verify user is logged in
   - Check cookie expiration
   - Ensure backend authentication middleware

3. **CORS errors**

   - Verify frontend URL in backend CORS config
   - Check that credentials are allowed

4. **Profile updates not reflected**
   - Ensure AuthContext state is updated after successful API call
   - Check that UI components are using latest user data

## 🎉 Success Criteria

✅ User can view their profile  
✅ User can update profile information  
✅ Changes are saved to backend database  
✅ UI reflects changes immediately  
✅ Error handling works correctly  
✅ Loading states provide good UX  
✅ Trust points display correctly  
✅ Avatar upload functionality works  
✅ Authentication persists across page refreshes
