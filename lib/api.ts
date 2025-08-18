import { APIResponse, AuthUser, Contact, LoginCredentials } from '@/types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import "react-native-url-polyfill/auto";
const API_BASE_URL = "https://hr.kms-technology.com/api";
const AUTH_TOKEN =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IkJFMUY1QkQ0ODUxNzk2NzNDNERGMzJEMzdDNDhCQ0E3NUE3ODcyNDZSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6InZoOWIxSVVYbG5QRTN6TFRmRWk4cDFwNGNrWSJ9.eyJuYmYiOjE3NTU0ODQ5ODYsImV4cCI6MTc1NTQ4ODU4NiwiaXNzIjoiaHR0cHM6Ly9ob21lLWxvZ2luLmttcy10ZWNobm9sb2d5LmNvbSIsImF1ZCI6InN5cy5ocm0iLCJjbGllbnRfaWQiOiI0YzZkN2ExM2VmYzM0NWFhOWQyM2ZkZDE4MjU3ODEyOSIsInN1YiI6Im5pbmhuZ3V5ZW5Aa21zLXRlY2hub2xvZ3kuY29tIiwiYXV0aF90aW1lIjoxNzU1NDEzMDAxLCJpZHAiOiJsb2NhbCIsImVtcGxveWVlQ29kZSI6IjQwMDQiLCJlbXBsb3llZUlkIjo3NDI2LCJmaXJzdE5hbWUiOiJOaW5oIiwibWlkZGxlTmFtZSI6IiIsImxhc3ROYW1lIjoiTmd1eWVuIiwiZnVsbE5hbWUiOiJOaW5oIE5ndXllbiIsInVzZXJfaWQiOjc0MjYsInByZWZlcnJlZF91c2VybmFtZSI6Im5pbmhuZ3V5ZW4iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiTmluaCBOZ3V5ZW4iLCJqdGkiOiIwNzJGRDc4NTVEODY3RjI0NjE5NzUwNDVDMTYwMEI2NCIsInNpZCI6IjJBMTMxQTFCN0RFMjdDNjQxODQzREQ3OTE0QUEyM0FFIiwiaWF0IjoxNzU1NDEzMDAyLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiaHJtLm1vZGlmeSIsImN1c3RvbSIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.baFqUyMh-MbsODkyVEnAtPTc44wO-ml15gyJemFTyFbhwY_JSEETAGa2vFkwV1d626t1moU-wIIhiSARUXtVm5omxQWSV2tvg_s9JBPuvWWgQg_KRlb1l4Hxwsu5fbgXFEkGnIqcMIpuqYNInAH5IJC2_7AdEo2nk7AwBoHr2tq48Esu1-sYMpNiy-In2cOy9hyteXWuP-nSEIqgqUfA-U2iW6iopoC7nfCBJhxICYV8-p6mFr54bOXxoWmR_g3ZQosxi7KeQ5-0IkeAhlQW1OBKnRCx0fvIAKOLUSTeTsU8PE3AoMXibYHj3qLuka2tgbhbqTzYTGbp1KuZqDINSQ";
const BASE_URL = API_BASE_URL;
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
        this.token = AUTH_TOKEN || null;
      }
    } catch (error) {
      console.error("Error loading token:", error);
      // Fallback to environment variable in case of error
      this.token = AUTH_TOKEN || null;
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
