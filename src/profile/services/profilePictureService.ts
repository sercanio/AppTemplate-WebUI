import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5070/api/v1";

export interface ProfilePictureResponse {
  profilePictureUrl: string;
}

export class ProfilePictureService {
  /**
   * Upload a profile picture
   */
  static async uploadProfilePicture(file: File): Promise<ProfilePictureResponse> {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post<ProfilePictureResponse>(
        `${API_URL}/Users/profile-picture`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      throw error;
    }
  }

  /**
   * Delete the current user's profile picture
   */
  static async deleteProfilePicture(): Promise<void> {
    try {
      await axios.delete(`${API_URL}/Users/profile-picture`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Failed to delete profile picture:", error);
      throw error;
    }
  }
}
