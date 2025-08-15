import { APIResponse, AuthUser, Contact, LoginCredentials } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import "react-native-url-polyfill/auto";

const BASE_URL = process.env.API_BASE_URL;
console.log("API_BASE_URL:", BASE_URL);
console.log("AUTH_TOKEN:", process.env.AUTH_TOKEN);
class KMSAPIService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      // First try to get token from AsyncStorage
      const storedToken = await AsyncStorage.getItem("auth_token");
      if (storedToken) {
        this.token = storedToken;
      } else {
        // Fallback to environment variable if no stored token
        this.token = process.env.AUTH_TOKEN || null;
      }
    } catch (error) {
      console.error("Error loading token:", error);
      // Fallback to environment variable in case of error
      this.token = process.env.AUTH_TOKEN || null;
    }
  }

  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem("auth_token", token);
      this.token = token;
    } catch (error) {
      console.error("Error saving token:", error);
    }
  }

  private async clearToken() {
    try {
      await AsyncStorage.removeItem("auth_token");
      this.token = null;
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  async login(credentials: LoginCredentials): Promise<APIResponse<AuthUser>> {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials, {
        headers: this.getHeaders(),
      });

      if (response.data && response.data.token) {
        await this.saveToken(response.data.token);
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid login response",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  }

  async logout(): Promise<APIResponse<null>> {
    try {
      await this.clearToken();
      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  }

  async fetchContacts(): Promise<APIResponse<Contact[]>> {
    try {
      if (!this.token) {
        return {
          success: false,
          error: "No authentication token available",
        };
      }

      const response = await axios.get(
        `${BASE_URL}/Contact/ReturnContactList/0/0`,
        {
          headers: this.getHeaders(),
        }
      );
      if (response.data) {
        // Transform the API response to match our Contact interface
        const contacts: Contact[] = response.data.items.map((item: any) => ({
          id:
            item.id ||
            item.employeeId ||
            Math.random().toString(36).substr(2, 9),
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          fullName: `${item.firstName || ""} ${item.lastName || ""}`.trim(),
          email: item.email || "",
          phone: item.phone || item.mobilePhone || "",
          department: item.department || item.departmentName || "",
          position: item.position || item.jobTitle || "",
          location: item.location || item.office || "",
          avatar: item.avatar || item.profilePicture,
          groups: [],
        }));
        console.log("Transformed contacts:", contacts);
        return {
          success: true,
          data: contacts,
        };
      }

      return {
        success: false,
        error: "Invalid contacts response",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch contacts",
      };
    }
  }

  async updateContact(
    contactId: string,
    contactData: Partial<Contact>
  ): Promise<APIResponse<Contact>> {
    try {
      if (!this.token) {
        return {
          success: false,
          error: "No authentication token available",
        };
      }

      const response = await axios.put(
        `${BASE_URL}/Contact/${contactId}`,
        contactData,
        {
          headers: this.getHeaders(),
        }
      );

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid update response",
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update contact",
      };
    }
  }

  isAuthenticated(): boolean {
    // return !!this.token;
    return true;
  }
}

export const kmsAPI = new KMSAPIService();
