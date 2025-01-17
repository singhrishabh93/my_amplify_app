import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../data/resource";

export class UserInfoDao {
  private client;

  constructor() {
    console.log("Initializing UserInfoDao...");
    try {
      this.client = generateClient<Schema>();
      console.log("Client generated successfully:", !!this.client);
      console.log("Available models:", {
        models: Object.keys(this.client || {}),
        UserInfo: !!this.client?.models?.UserInfo
      });
    } catch (error) {
      console.error("Error generating client:", error);
      throw error;
    }
  }

  /**
   * Creates a new user info record
   */
  async createUserInfo(
    userId: string,
    userFullName: string,
    userWhatsAppNumber: string,
    userStatus: "NEW" | "ONBOARDED" | "INACTIVE" = "NEW",
    authToken: string
  ) {
    console.log("Creating user info with params:", {
      userId,
      userFullName,
      userWhatsAppNumber,
      userStatus,
      authToken,
    });

    try {
      if (!this.client?.models?.UserInfo) {
        console.error("Client or UserInfo model not available:", {
          clientExists: !!this.client,
          UserInfoExists: !!this.client?.models?.UserInfo
        });
        throw new Error("UserInfo model not initialized");
      }

      const result = await this.client.models.UserInfo.create({
        userId,
        userFullName,
        userWhatsAppNumber,
        userStatus,
        authToken
      });
      console.log("User info created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating user info:", error);
      throw error;
    }
  }

  /**
   * Updates an existing user info record
   */
  async updateUserInfo(
    userId: string,
    updates: {
      userFullName?: string;
      userWhatsAppNumber?: string;
      userStatus?: "NEW" | "ONBOARDED" | "INACTIVE";
      token?: string;
    }
  ) {
    try {
      return await this.client.models.UserInfo.update({
        userId,
        ...updates,
      });
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  }

  /**
   * Retrieves user info by userId
   */
  async getUserInfoById(userId: string) {
    try {
      const userInfo = await this.client.models.UserInfo.get({ userId });
      console.log("Retrieved user info:", {
        userId,
        hasInfo: !!userInfo?.data,
      });
      return userInfo;
    } catch (error) {
      console.error("Error getting user info:", error);
      throw error;
    }
  }

  //   /**
  //    * Lists all users with optional filter
  //    */
  //   async listUsers(filter?: {
  //     userStatus?: "NEW" | "ONBOARDED" | "INACTIVE";
  //   }) {
  //     try {
  //       return await this.client.models.UserInfo.list({
  //         filter: filter,
  //       });
  //     } catch (error) {
  //       console.error("Error listing users:", error);
  //       throw error;
  //     }
  //   }
}
