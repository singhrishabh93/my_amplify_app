import { MessageType } from "../constants/constants";

export class WhatsAppPayload {
  static validate(payload: any) {
    const requiredFields = ["recipientNumber", "messageType"];
    const missingFields = requiredFields.filter((field) => !payload[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (!this.isValidMessageContent(payload)) {
      throw new Error("Invalid message content for specified message type");
    }

    return true;
  }

  static isValidMessageContent(payload: any) {
    switch (payload.messageType.toLowerCase()) {
      case MessageType.TEXT:
        return !!payload.content?.text;
      case MessageType.IMAGE:
        return !!payload.content?.url;
      case MessageType.DOCUMENT:
        return !!payload.content?.url && !!payload.content?.filename;
      case MessageType.AUDIO:
        return !!payload.content?.url;
      case MessageType.INTERACTIVE_REPLY:
        return true;
      // TODO: needs to be fixed
      // return (
      //   !!payload.content?.body &&
      //   Array.isArray(payload.content?.action?.buttons) &&
      //   payload.content.action.buttons.length > 0 &&
      //   payload.content.action.buttons.length <= 3 &&
      //   payload.content.action.buttons.every((button: any) =>
      //     button.id &&
      //     button.title &&
      //     button.title.length <= 20
      //   )
      // );
      case MessageType.INTERACTIVE_LIST:
        return true;
      // TODO: needs to be fixed
      // return (
      //   !!payload.content?.body &&
      //   Array.isArray(payload.content?.sections) &&
      //   payload.content.sections.length > 0 &&
      //   payload.content.sections.every((section: any) =>
      //     section.title &&
      //     Array.isArray(section.rows) &&
      //     section.rows.length > 0 &&
      //     section.rows.every((row: any) =>
      //       row.type &&
      //       row.reply &&
      //       row.reply.id &&
      //       row.reply.title &&
      //       row.reply.title.length <= 24
      //     )
      //   )
      // );
      default:
        return false;
    }
  }
}

export const PayloadExample = {
  recipientNumber: "1234567890", // Required: Target WhatsApp number
  messageType: "text", // Required: text|image|audio|document
  content: {
    // For text messages
    text: "Hello World",
    previewUrl: false, // Optional

    // For media messages (image/audio/document)
    url: "https://example.com/image.jpg",
    caption: "Optional caption", // Optional for images
    filename: "document.pdf", // Required for documents
  },
  contextMessageId: "original_message_id", // Optional: for threaded replies
};
