export enum MessageDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
  }
  
  export enum MessageStatus {
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    RECEIVED = "RECEIVED",
  }
  
  export enum UserStatus {
    NEW = "NEW",
    ONBOARDED = "ONBOARDED",
    INACTIVE = "INACTIVE",
  }
  
  export const MessageType = {
    TEXT: "text",
    IMAGE: "image",
    AUDIO: "audio",
    DOCUMENT: "document",
    VIDEO: "video",
    STICKER: "sticker",
    LOCATION: "location",
    CONTACTS: "contacts",
    INTERACTIVE: "interactive",
    INTERACTIVE_REPLY: "INTERACTIVE_REPLY",
    INTERACTIVE_LIST: "INTERACTIVE_LIST"
  };
  
  export enum CaseStatus {
    NEW = "NEW",
    USECASE_IDENTIFIED = "USECASE_IDENTIFIED",
    CONTEXT_GATHERED = "CONTEXT_GATHERED",
    OUTPUT_SENT = "OUTPUT_SENT",
    FEEDBACK_LOOP = "FEEDBACK_LOOP",
    CLOSED = "CLOSED"
  }
  