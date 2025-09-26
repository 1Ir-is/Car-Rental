import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI, authUtils } from "../services/authService";
import { userService } from "../services/userService";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  UPDATE_USER: "UPDATE_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
    case AuthActionTypes.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload.error,
      };

    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("=== AUTH INITIALIZATION START ===");

      try {
        // Với HttpOnly cookies, chúng ta cần gọi API để check auth state
        console.log("🍪 Checking auth state via API...");
        const response = await userService.getCurrentProfile();

        if (response.success && response.data) {
          console.log("✅ User authenticated via cookies:", response.data);
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: response.data },
          });
        } else {
          console.log("❌ No valid session found");
          dispatch({
            type: AuthActionTypes.SET_LOADING,
            payload: { loading: false },
          });
        }
      } catch (error) {
        console.log("❌ Auth check failed:", error.message);
        // Nếu API call thất bại, check localStorage như fallback
        const user = authUtils.getCurrentUser();
        if (user) {
          console.log("📦 Using cached user data:", user);
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user },
          });
        } else {
          dispatch({
            type: AuthActionTypes.SET_LOADING,
            payload: { loading: false },
          });
        }
      }

      console.log("=== AUTH INITIALIZATION END ===");
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });

    try {
      const result = await authAPI.login(credentials);

      if (result.success) {
        console.log("✅ Login successful, fetching fresh user profile...");

        // Sau khi login thành công, lấy user profile mới nhất từ backend
        try {
          const profileResult = await userService.getCurrentProfile();

          if (profileResult.success) {
            // Sử dụng data mới nhất từ profile API
            const freshUser = profileResult.data;
            authUtils.saveUser(freshUser);
            console.log("💾 Fresh user data saved:", freshUser);

            dispatch({
              type: AuthActionTypes.LOGIN_SUCCESS,
              payload: { user: freshUser },
            });

            return { success: true, user: freshUser };
          } else {
            // Fallback: sử dụng data từ login response nếu không lấy được profile
            console.log(
              "⚠️ Could not fetch fresh profile, using login response data"
            );
            const loginUser = result.user;
            if (loginUser) {
              authUtils.saveUser(loginUser);
            }

            dispatch({
              type: AuthActionTypes.LOGIN_SUCCESS,
              payload: { user: loginUser },
            });

            return result;
          }
        } catch (profileError) {
          console.error("❌ Error fetching fresh profile:", profileError);
          // Fallback: sử dụng data từ login response
          const loginUser = result.user;
          if (loginUser) {
            authUtils.saveUser(loginUser);
          }

          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: loginUser },
          });

          return result;
        }
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: { error: result.message },
        });
        return result;
      }
    } catch (error) {
      const errorMessage = "Login failed. Please try again.";
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AuthActionTypes.REGISTER_START });

    try {
      const result = await authAPI.register(userData);

      if (result.success) {
        dispatch({ type: AuthActionTypes.REGISTER_SUCCESS });
        return result;
      } else {
        dispatch({
          type: AuthActionTypes.REGISTER_FAILURE,
          payload: { error: result.message },
        });
        return result;
      }
    } catch (error) {
      const errorMessage = "Registration failed. Please try again.";
      dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      // Clear localStorage cache
      authUtils.clearAuthData();
      dispatch({ type: AuthActionTypes.LOGOUT });
      console.log("🚪 Logout successful, localStorage cleared");
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      // Force logout even if API call fails
      authUtils.clearAuthData();
      dispatch({ type: AuthActionTypes.LOGOUT });
      console.log("🚪 Force logout, localStorage cleared");
      return { success: true, message: "Logged out successfully" };
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      console.log("Updating user profile with data:", userData);

      // Show loading state
      dispatch({
        type: AuthActionTypes.SET_LOADING,
        payload: { loading: true },
      });

      // Use the userService for profile updates
      const response = await userService.updateProfile(userData);

      if (response.success) {
        // Save updated user data to localStorage cache
        authUtils.saveUser(response.data);
        console.log("💾 Updated user data saved to localStorage");

        // Update local state with the updated user data
        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { user: response.data },
        });
        console.log("Profile updated successfully:", response.data);
        return { success: true, data: response.data };
      } else {
        console.error("Failed to update user profile:", response.message);
        return {
          success: false,
          message: response.message || "Failed to update profile",
        };
      }
    } catch (error) {
      console.error("Error updating user profile:", error);

      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        if (status === 401) {
          // Unauthorized - redirect to login
          console.log("User unauthorized, logging out...");
          logout();
          return {
            success: false,
            message: "Session expired. Please login again.",
          };
        } else if (status === 400) {
          // Bad request - validation error
          return {
            success: false,
            message: message || "Invalid data provided",
          };
        } else if (status >= 500) {
          // Server error
          return {
            success: false,
            message: "Server error. Please try again later.",
          };
        }

        return {
          success: false,
          message: message || "Failed to update profile",
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          message: "Network error. Please check your connection.",
        };
      } else {
        // Other error
        return { success: false, message: "An unexpected error occurred" };
      }
    } finally {
      dispatch({
        type: AuthActionTypes.SET_LOADING,
        payload: { loading: false },
      });
    }
  };

  // Get current user profile
  const getCurrentUserProfile = async () => {
    try {
      const response = await userService.getCurrentProfile();

      if (response.success) {
        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: { user: response.data },
        });
        return response;
      }
      return response;
    } catch (error) {
      console.error("Get current user error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch user profile",
      };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const result = await authAPI.forgotPassword(email);
      return result;
    } catch (error) {
      return { success: false, message: "Failed to send reset email" };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  const loginWithGoogle = async (idToken) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      const result = await authAPI.loginWithGoogle(idToken);

      if (result.success) {
        // Lấy user profile mới nhất từ backend
        try {
          const profileResult = await userService.getCurrentProfile();
          if (profileResult.success) {
            const freshUser = profileResult.data;
            authUtils.saveUser(freshUser);
            dispatch({
              type: AuthActionTypes.LOGIN_SUCCESS,
              payload: { user: freshUser },
            });
            return { success: true, user: freshUser };
          }
        } catch (err) {
          // fallback: không lấy được profile thì vẫn login
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: null },
          });
          return { success: true };
        }
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: { error: result.message },
        });
        return result;
      }
    } catch (error) {
      const errorMessage = "Google login failed. Please try again.";
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, message: errorMessage };
    }
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    updateUser,
    getCurrentUserProfile,
    forgotPassword,
    clearError,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
