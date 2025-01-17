import { generateClient } from "aws-amplify/api";
import { type Schema } from "../../data/resource";

export class ConnectionDao {
  private client;

  constructor() {
    console.log("Initializing  Connection Dao");
    try {
      this.client = generateClient<Schema>();
      console.log("Client generated successfully:", !!this.client);
      console.log("Available models: ", {
        models: Object.keys(this.client || {}),
        ConnectionInfo: !!this.client?.models?.ConnectionInfo,
      });
    } catch (error) {
      console.log("Error generating client : ", error);
      throw error;
    }
  }
  async createConnection(
    connectionId: string,
    userId: string,
    createdAt: string
  ) {
    console.log("Creating Connection with params:", {
      connectionId,
      userId,
      createdAt,
    });

    try {
      if (!this.client?.models?.ConnectionInfo) {
        console.error("Client or ConnectionInfo model not available:", {
          clientExists: !!this.client,
          ConnectionInfoExists: !!this.client?.models?.ConnectionInfo,
        });
        throw new Error("ConnectionInfo model not initialized");
      }
      const result = await this.client.models.ConnectionInfo.create({
        connectionId,
        userId,
        createdAt,
      });
      console.log("Connection created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating connection:", error);
      throw error;
    }
  }
  async deleteConnection(connectionId: string) {
    console.log("Deleting Connection with connectionId:", connectionId);
    try {
      if (!this.client?.models?.ConnectionInfo) {
        console.error("Client or ConnectionInfo model not available:", {
          clientExists: !!this.client,
          ConnectionInfoExists: !!this.client?.models?.ConnectionInfo,
        });
        throw new Error("ConnectionInfo model not initialized");
      }
      const result = await this.client.models.ConnectionInfo.delete({
        connectionId,
      });
      console.log("Connection deleted successfully:", result);
      return result;
    } catch (error) {
      console.error("Error deleting connection:", error);
      throw error;
    }
  }
  async getConnection(connectionId: string) {
    console.log("Getting Connection with connectionId:", connectionId);
    try {
      if (!this.client?.models?.ConnectionInfo) {
        console.error("Client or ConnectionInfo model not available:", {
          clientExists: !!this.client,
          ConnectionInfoExists: !!this.client?.models?.ConnectionInfo,
        });
        throw new Error("ConnectionInfo model not initialized");
      }
      const result = await this.client.models.ConnectionInfo.get({
        connectionId,
      });
      console.log("Connection retrieved successfully:", result);
      return result;
    } catch (error) {
      console.error("Error getting connection:", error);
      throw error;
    }
  }
}
