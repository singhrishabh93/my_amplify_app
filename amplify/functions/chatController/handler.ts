// handlers/chatController.ts

import { APIGatewayProxyHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { AxiosClient } from "../integrations/axiosClient";
import { MessageDao } from "../dao/messageDao";
import {
  MessageSource,
  WhatsAppMessageRequest,
  AppMessageRequest,
} from "../types";
import outputs from "../../../amplify_outputs.json";

console.log("[INIT] === Initializing Chat Controller ===");
Amplify.configure(outputs);
console.log("[CHAT_HANDLER] Initializing clients:");

const authClient = AxiosClient.getInstance(
  outputs.custom.API.authApi.endpoint
).getClient();
const gatewayClient = AxiosClient.getInstance(
  // outputs.custom.API.gatewayApi.endpoint " "
  ""
).getClient();
const messageDao = new MessageDao();

export const handler: APIGatewayProxyHandler = async (event, context) => {
  console.log("[CHAT_HANDLER] === Starting Chat Controller Handler ===", {
    requestId: context.awsRequestId,
    timestamp: new Date().toISOString(),
  });

  try {
    // Initialize clients

    // Determine message source
    console.log("[CHAT_HANDLER] Determining message source...");

    const messageSource = determineMessageSource(event);

    console.log("[CHAT_HANDLER] Message source:", messageSource);

    switch (messageSource) {
      case MessageSource.APP: {
        // Verify JWT token for APP requests
        console.log("[CHAT_HANDLER] Verifying if JWT token is present...");
        const authHeader = event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return {
            statusCode: 401,
            body: JSON.stringify({
              message: "Missing or invalid authorization token",
            }),
          };
        }

        // Verify token with auth service
        console.log("[CHAT_HANDLER] Validating JWT token...");
        try {
          await authClient.post(
            "/auth/validate",
            {},
            {
              headers: { Authorization: authHeader },
            }
          );
        } catch (error) {
          console.error("[CHAT_HANDLER] Token validation failed:", error);
          return {
            statusCode: 401,
            body: JSON.stringify({ message: "Invalid authorization token" }),
          };
        }

        // Process APP message
        // Should be part of chat Service.ts
        const appRequest = parseAppRequest(event);
        console.log("[CHAT_HANDLER] Processing APP request:", {
          userId: appRequest.userId,
          messageId: appRequest.messageId,
        });

        // Call gateway service
        const gatewayResponse = await gatewayClient.post(
          "/gateway",
          appRequest
        );

        //TODO : Duplicate Code ... Create Util Function

        // Store the AI response as outbound message
        if (gatewayResponse.data?.maissResult?.content) {
          await messageDao.createMessage(
            gatewayResponse.data.caseId,
            `${appRequest.messageId}_response`,
            appRequest.userId,
            "OUTBOUND",
            "SENT",
            gatewayResponse.data.maissResult.messageType || "TEXT",
            gatewayResponse.data.maissResult.content
          );
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Message processed successfully",
            data: gatewayResponse.data,
          }),
        };
      }

      case MessageSource.WHATSAPP: {
        // Process WhatsApp webhook verification
        if (event.queryStringParameters) {
          return handleWebhookVerification(event.queryStringParameters);
        }

        // Process WhatsApp message
        const whatsappRequest = parseWhatsAppRequest(event);
        if (!whatsappRequest) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Invalid WhatsApp request format",
            }),
          };
        }

        const body = event.body ? JSON.parse(event.body) : null;
        if (
          body.object !== "whatsapp_business_account" &&
          !body.entry?.[0].changes?.[0].value.messages
        ) {
          console.warn("Invalid WhatsApp message format");
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Invalid WhatsApp message format",
            }),
          };
        }
        // Call gateway service
        const gatewayResponse = await gatewayClient.post(
          "/gateway",
          whatsappRequest
        );

        console.log(
          `[INBOUND] tid=${whatsappRequest.messageId} Gateway service response:`,
          {
            status: gatewayResponse.status,
            data: gatewayResponse.data,
          }
        );

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "WhatsApp message processed successfully",
            data: gatewayResponse.data,
          }),
        };
      }

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid message source" }),
        };
    }
  } catch (error) {
    console.error("[CHAT_HANDLER_ERROR] Unhandled Error:", {
      error,
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

function determineMessageSource(event: any): MessageSource {
  // WhatsApp requests have specific query parameters for webhook verification
  // or contain WhatsApp-specific payload structure
  if (
    event.queryStringParameters?.["hub.mode"] ||
    (event.body &&
      JSON.parse(event.body)?.object === "whatsapp_business_account")
  ) {
    return MessageSource.WHATSAPP;
  }
  return MessageSource.APP;
}

function parseAppRequest(event: any): AppMessageRequest {
  const body = JSON.parse(event.body);
  return {
    source: MessageSource.APP,
    userId: body.userId,
    userFullName: body.userFullName,
    userWhatsAppNumber: body.userWhatsAppNumber,
    messageId: body.messageId,
    messageType: body.messageType,
    messageDirection: body.messageDirection,
    messageContent: body.messageContent,
  };
}

function parseWhatsAppRequest(event: any) {
  if (!event.body) {
    console.warn("Missing request body");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing body" }),
    };
  }

  const body = JSON.parse(event.body);
  console.log("Parsed webhook body:", {
    object: body.object,
    hasEntry: !!body.entry,
    entryCount: body.entry?.length,
  });

  if (body.entry?.[0].changes?.[0].value.statuses) {
    const status = body.entry[0].changes[0].value.statuses[0];
    console.log(`[STATUS_UPDATE] tid=${status.id} Processing message status:`, {
      status: status.status,
      timestamp: status.timestamp,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Status update processed successfully",
      }),
    };
  }

  const message = body.entry[0].changes[0].value.messages[0];
  const contact = body.entry[0].changes[0].value.contacts[0];

  console.log(`[INBOUND] tid=${message.id} Message details:`, {
    messageType: message.type,
    userId: contact.wa_id,
    userFullName: contact.profile.name,
    timestamp: new Date().toISOString(),
  });

  return {
    source: MessageSource.WHATSAPP,
    userId: contact.wa_id,
    userFullName: contact.profile.name,
    userWhatsAppNumber: contact.wa_id,
    messageId: message.id,
    messageType: message.type.toUpperCase(),
    messageDirection: "INBOUND",
    messageContent: message[message.type],
    entry: body.entry,
  };
}

function handleWebhookVerification(queryParams: any) {
  const verify_token = process.env.VERIFY_TOKEN;
  const mode = queryParams["hub.mode"];
  const token = queryParams["hub.verify_token"];
  const challenge = queryParams["hub.challenge"];
  console.log("[CHAT_HANDLER] Handling WhatsApp webhook verification:", {
    mode,
    tokenProvided: !!token,
    hasChallenge: !!challenge,
  });

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      console.log("Webhook verified successfully");
      return {
        statusCode: 200,
        body: challenge || "",
      };
    } else {
      console.warn("Webhook verification failed:", {
        mode,
        tokenMatch: token === verify_token,
      });
      return {
        statusCode: 403,
        body: "",
      };
    }
  }

  // Return a '400 Invalid Request' if the token is missing
  console.warn("Invalid webhook verification request");
  return {
    statusCode: 400,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify({ message: "Invalid request" }),
  };
}
