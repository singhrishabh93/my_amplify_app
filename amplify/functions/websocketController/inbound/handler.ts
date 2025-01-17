// functions/websocketInbound/handler.ts

import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { Amplify } from "aws-amplify";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;

  console.log(`[WEBSOCKET][INBOUND] Event:`, {
    connectionId,
    body: event.body,
    timestamp: new Date().toISOString()
  });

  try {
    // Here you can add your AI processing logic
    console.log(`[WEBSOCKET][INBOUND] Message received:`, { connectionId });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message received successfully' })
    } ;

  } catch (error) {
    console.error(`[WEBSOCKET][INBOUND] Error:`, { error, connectionId });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Inbound error: ${error}` })
    };
  }
};