// functions/websocketConnect/handler.ts

import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { ConnectionDao } from "../../dao/connectionDao";
import { Amplify } from "aws-amplify";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const connectionDao = new ConnectionDao();
  const queryParams = (event as any).queryStringParameters;

  console.log(`[WEBSOCKET][CONNECT] Event:`, {
    connectionId,
    queryParams,
    timestamp: new Date().toISOString()
  });

  try {
    const userId = queryParams?.userId;
    if (!userId) {
      console.error(`[WEBSOCKET][CONNECT] User Id not found for connectionId: ${connectionId}`);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `User Id not found for connectionId: ${connectionId}` })
      };
    }

    await connectionDao.createConnection(connectionId, userId, Date.now().toString());
    
    console.log(`[WEBSOCKET][CONNECT] Connection established:`, { connectionId, userId });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected successfully' })
    } ;

  } catch (error) {
    console.error(`[WEBSOCKET][CONNECT] Error:`, { error, connectionId });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Connection error: ${error}` })
    } ;
  }
};