export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "INTERACTIVE_LIST"
  | "INTERACTIVE_REPLY";
export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "RECEIVED";

export enum MessageSource {
  APP = "APP",
  WHATSAPP = "WHATSAPP",
}

export interface BaseMessageRequest {
  source: MessageSource;
  userId: string;
  userFullName: string;
  userWhatsAppNumber: string;
  messageId: string;
  messageType: string;
  messageDirection: "INBOUND" | "OUTBOUND";
  messageContent: any;
}
export interface AppMessageRequest extends BaseMessageRequest {
  source: MessageSource.APP;
}

export interface WhatsAppMessageRequest extends BaseMessageRequest {
  source: MessageSource.WHATSAPP;
  entry: Array<{
    changes: Array<{
      value: {
        messages: Array<any>;
        contacts: Array<any>;
      };
    }>;
  }>;
}
export interface MessageContent {
  text?: string;
  url?: string;
  caption?: string;
  //   options?: Array<{
  //     id: string;
  //     title: string;
  //     description?: string;
  //   }>;
  // Add other content types as needed
}

export interface GatewayRequestPayload {
  // User Information
  userId: string;
  userFullName: string;
  userWhatsAppNumber: string;

  // Message Information
  messageId: string;
  messageType: MessageType;
  messageDirection: MessageDirection;
  messageContent: MessageContent;
}

// // Response types
// export interface GatewaySuccessResponse {
//   message: string;
//   caseId: string;
// }

// export interface GatewayErrorResponse {
//   message: string;
//   error?: string;
// }

// WhatsApp Webhook Types
export interface MessageStatusUpdate {
  caseId: string;
  messageId: string;
  messageStatus: "DELIVERED" | "READ";
}

export interface WhatsAppStatusUpdate {
  recipient_id: string;
  id: string;
  status: string;
}

export interface WhatsAppWebhookBody {
  object: string;
  entry?: Array<{
    changes?: Array<{
      value: {
        statuses?: WhatsAppStatusUpdate[];
      };
    }>;
  }>;
}

export interface Case {
  userId: string;
  caseId: string;
  caseStartTime: string;
  caseEndTime?: string;
  caseStatus: CaseStatus;
  messages: string[];
}

export interface CreateCaseInput {
  userId: string;
  caseStatus?: CaseStatus;
  messages?: string[];
}

export interface UpdateCaseInput {
  caseStatus?: CaseStatus;
  messages?: string[];
  caseEndTime?: string;
}

export interface ListCasesInput {
  userId: string;
  status?: CaseStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  nextToken?: string;
}

export interface APIResponse<T> {
  data: T;
  nextToken?: string;
  error?: string;
}

export enum CaseStatus {
  NEW = "NEW",
  USECASE_IDENTIFIED = "USECASE_IDENTIFIED",
  CONTEXT_GATHERED = "CONTEXT_GATHERED",
  OUTPUT_SENT = "OUTPUT_SENT",
  FEEDBACK_LOOP = "FEEDBACK_LOOP",
  CLOSED = "CLOSED",
}

export interface MessageInput {
  messageId: string;
  messageContent: any;
}

export interface Message {
  caseId: string;
  messageId: string;
  messageType: string;
  messageDirection: string;
  messageStatus?: string;
  content: string;
  timestamp: string;
}

export interface WhatsAppTextContent {
  text: string;
  previewUrl?: boolean;
}

export interface WhatsAppMediaContent {
  url: string;
  caption?: string;
}

export interface WhatsAppDocumentContent extends WhatsAppMediaContent {
  filename: string;
}

export type WhatsAppMessageContent = {
  text?: string;
  previewUrl?: boolean;
  url?: string;
  caption?: string;
  filename?: string;
};

export interface WhatsAppPayloadType {
  recipientNumber: string;
  messageType: MessageType | string;
  content: WhatsAppMessageContent;
  contextMessageId?: string;
}

// Validation interface for type checking
export interface WhatsAppValidation {
  validate(payload: WhatsAppPayload): boolean;
  isValidMessageContent(payload: WhatsAppPayload): boolean;
}
