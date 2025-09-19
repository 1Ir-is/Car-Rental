// Test file to verify API integration
import {
  updateUserProfile,
  getCurrentUserProfile,
} from "../services/authService";

export const testAPI = {
  // Test get current user profile
  async testGetProfile() {
    try {
      console.log("Testing getCurrentUserProfile...");
      const response = await getCurrentUserProfile();
      console.log("GET Profile Response:", response);
      return response;
    } catch (error) {
      console.error("GET Profile Error:", error);
      throw error;
    }
  },

  // Test update user profile
  async testUpdateProfile(profileData) {
    try {
      console.log("Testing updateUserProfile with data:", profileData);
      const response = await updateUserProfile(profileData);
      console.log("UPDATE Profile Response:", response);
      return response;
    } catch (error) {
      console.error("UPDATE Profile Error:", error);
      throw error;
    }
  },

  // Test with sample data
  async runTests() {
    console.log("Starting API integration tests...");

    try {
      // Test 1: Get current profile
      console.log("\n--- Test 1: Get Current Profile ---");
      const currentProfile = await this.testGetProfile();

      if (currentProfile && currentProfile.data) {
        // Test 2: Update profile with current data (no changes)
        console.log("\n--- Test 2: Update Profile (No Changes) ---");
        const updateResult = await this.testUpdateProfile(currentProfile.data);

        // Test 3: Update profile with minimal changes
        console.log("\n--- Test 3: Update Profile (With Changes) ---");
        const modifiedData = {
          ...currentProfile.data,
          phone: currentProfile.data.phone || "0123456789",
          address: currentProfile.data.address || "Test Address",
        };
        const updateResult2 = await this.testUpdateProfile(modifiedData);

        console.log("\n--- All tests completed successfully ---");
        return {
          success: true,
          results: {
            getProfile: currentProfile,
            updateNoChange: updateResult,
            updateWithChange: updateResult2,
          },
        };
      } else {
        throw new Error("Failed to get current profile");
      }
    } catch (error) {
      console.error("\n--- Tests failed ---");
      console.error("Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Export for console testing
window.apiTest = testAPI;
