import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../data/resource";

export class MessageDao {
  private client;

  constructor() {
    console.log("Initializing MessageDao...");
    try {
      this.client = generateClient<Schema>();
      console.log("Client generated successfully:", {
        clientExists: !!this.client,
        modelsExist: !!this.client?.models,
        messagesModelExists: !!this.client?.models?.Messages
      });
    } catch (error) {
      console.error("Error initializing MessageDao:", error);
      throw error;
    }
  }

  /**
   * Creates a new message record
   */
  async createMessage(
    caseId: string,
    messageId: string,
    userId: string,
    messageDirection: "INBOUND" | "OUTBOUND",
    messageStatus: "SENT" | "DELIVERED" | "READ" | "RECEIVED",
    messageType: "TEXT" | "IMAGE" | "INTERACTIVE",
    messageContent: any
  ) {
    console.log('=== Creating Message Record ===', {
      caseId,
      messageId,
      userId,
      messageDirection,
      messageStatus,
      messageType,
      messageContent
    });

    try {
      console.log('Message content:', {
        type: typeof messageContent,
        contentLength: JSON.stringify(messageContent).length,
        content: messageContent
      });

      console.log('Attempting to create message record in database');
      const result = await this.client.models.Messages.create({
        caseId,
        messageId,
        userId,
        messageDirection,
        messageStatus,
        messageType,
        messageContent: JSON.stringify(messageContent),
      });

      console.log("Message record created successfully:", result);

      console.log('Message record created successfully:', {
        createdAt: result.data?.createdAt,
        messageId: result.data?.messageId,
        status: result.data?.messageStatus
      });

      return result;

    } catch (error) {
      console.error('=== Error Creating Message Record ===', {
        error,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        caseId,
        messageId,
        userId,
        messageDirection,
        messageType,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Updates an existing message
   */
  async updateMessage(
    caseId: string,
    messageId: string,
    updates: {
      messageStatus?: "SENT" | "DELIVERED" | "READ" | "RECEIVED";
      messageContent?: any;
    }
  ) {
    try {
      return await this.client.models.Messages.update({
        caseId,
        messageId,
        ...updates,
      });
    } catch (error) {
      console.error("Error updating message:", error);
      throw error;
    }
  }

  /**
   * Retrieves message by caseId and messageId
   */
  async getMessageById(caseId: string, messageId: string) {
    try {
      return await this.client.models.Messages.get({ caseId, messageId });
    } catch (error) {
      console.error("Error getting message:", error);
      throw error;
    }
  }

  /**
   * Lists all messages for a specific case
   */
  async listMessagesByCase(caseId: string) {
    try {
      return await this.client.models.Messages.list({
        filter: { caseId: { eq: caseId } },
      });
    } catch (error) {
      console.error("Error listing messages:", error);
      throw error;
    }
  }

  /**
   * Updates message status for one or multiple messages
   * @param updates Array of message status updates
   * @returns Promise with the results of all updates
   */
  async updateMessageStatuses(
    updates: Array<{
      caseId: string;
      messageId: string;
      messageStatus: "SENT" | "DELIVERED" | "READ" | "RECEIVED";
    }>
  ) {
    try {
      // Process all updates in parallel
      const updatePromises = updates.map(
        ({ caseId, messageId, messageStatus }) =>
          this.client.models.Messages.update({
            caseId,
            messageId,
            messageStatus,
          })
      );

      const results = await Promise.allSettled(updatePromises);

      // Log any failures
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Failed to update message status for caseId: ${updates[index].caseId}, messageId: ${updates[index].messageId}`,
            result.reason
          );
        }
      });

      return results;
    } catch (error) {
      console.error("Error updating message statuses:", error);
      throw error;
    }
  }
}
