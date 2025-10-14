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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await userService.getCurrentProfile();
        if (response.success && response.data) {
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: response.data },
          });
        } else {
          dispatch({
            type: AuthActionTypes.SET_LOADING,
            payload: { loading: false },
          });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          authUtils.clearAuthData();
          window.location.replace("/login"); // redirect về login mọi lúc nhận 401
          dispatch({
            type: AuthActionTypes.SET_LOADING,
            payload: { loading: false },
          });
        } else {
          const user = authUtils.getCurrentUser();
          if (user) {
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
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "user" && event.newValue === null) {
        // User logged out or token expired in another tab
        window.location.replace("/login");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    try {
      const result = await authAPI.login(credentials);

      if (result.success) {
        // Fetch profile mới nhất sau login
        const profileResult = await userService.getCurrentProfile();
        if (profileResult.success) {
          const freshUser = profileResult.data;
          authUtils.saveUser(freshUser); // Lưu vào localStorage
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: freshUser },
          });
          return { success: true, user: freshUser };
        } else {
          // Fallback
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: result.user },
          });
          return result;
        }
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: { error: result.message },
        });
        // Return the full result object to preserve error details
        return result;
      }
    } catch (error) {
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: "Login failed" },
      });
      return { success: false, message: "Login failed" };
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
        // Luôn gọi lại lấy profile mới nhất
        const profileResult = await userService.getCurrentProfile();
        let freshUser =
          (profileResult && profileResult.data) ||
          (profileResult && profileResult.user);
        if (freshUser) {
          authUtils.saveUser(freshUser);
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: { user: freshUser },
          });
          return { success: true, user: freshUser };
        }
        // fallback
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user: null },
        });
        return { success: true };
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: { error: result.message },
        });
        // Return the full result object to preserve error details
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
