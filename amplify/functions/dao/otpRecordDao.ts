import { generateClient } from "aws-amplify/api";
import { type Schema } from "../../data/resource";

export class OTPRecordDao {
  private client;

  constructor() {
    console.log("Initializing OTPRecordDao...");
    try {
      this.client = generateClient<Schema>();
      /*
                const client1 = null;
        const client2 = {};
        const client3 = "";

        console.log(!!client1); // false
        console.log(!!client2); // true
        console.log(!!client3); // false
            */
      console.log("Client generated successfully:", !!this.client);
      console.log("Avilable models:", {
        models: Object.keys(this.client || {}),
        OTPRecord: !!this.client?.models?.OTPRecord,
      });
    } catch (error) {
      console.error("Error generating client:", error);
      throw error;
    }
  }

  async createOTPRecord(
    phoneNumber: string,
    otp: string,
    expiresAt: number,
    attempts: number
  ) {
    console.log("Creating OTP record with params:", {
      phoneNumber,
      otp,
      expiresAt,
      attempts,
    });

    try {
      if (!this.client?.models?.OTPRecord) {
        console.error("Client or OTPRecord model not available:", {
          clientExists: !!this.client,
          OTPRecordExists: !!this.client?.models?.OTPRecord,
        });
        throw new Error("OTPRecord model not initialized");
      }
      const result = await this.client.models.OTPRecord.create({
        phoneNumber,
        otp,
        expiresAt,
        attempts,
      });
      console.log("OTP record created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating OTP record:", error);
      throw error;
    }
  }

  async updateOTPRecord(
    phoneNumber: string,
    updates: {
      otp?: string;
      expiresAt?: number;
      attempts?: number;
    }
  ) {
    try {
      return await this.client.models.OTPRecord.update({
        phoneNumber,
        ...updates,
      });
    } catch (error) {
      console.error("Error updating OTP record:", error);
      throw error;
    }
  }

  async getOTPRecord(phoneNumber: string) {
    try {
      const result = await this.client.models.OTPRecord.get({
        phoneNumber,
      });
      return result;
    } catch (error) {
      console.error("Error getting OTP record:", error);
      throw error;
    }
  }

  async deleteOTPRecord(phoneNumber: string) {
    try {
      return await this.client.models.OTPRecord.delete({
        phoneNumber,
      });
    } catch (error) {
      console.error("Error deleting OTP record:", error);
      throw error;
    }
  }
}
