// functions/websocketDisconnect/handler.ts

import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { ConnectionDao } from "../../dao/connectionDao";
import { Amplify } from "aws-amplify";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const connectionDao = new ConnectionDao();

  console.log(`[WEBSOCKET][DISCONNECT] Event:`, {
    connectionId,
    timestamp: new Date().toISOString()
  });

  try {
    await connectionDao.deleteConnection(connectionId);
    
    console.log(`[WEBSOCKET][DISCONNECT] Connection terminated:`, { connectionId });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected successfully' })
    };

  } catch (error) {
    console.error(`[WEBSOCKET][DISCONNECT] Error:`, { error, connectionId });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Disconnect error: ${error}` })
    };
  }
};