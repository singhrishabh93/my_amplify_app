// functions/websocketOutbound/handler.ts

import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { ConnectionDao } from "../../dao/connectionDao";
import { Amplify } from "aws-amplify";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const connectionDao = new ConnectionDao();

  console.log(`[WEBSOCKET][OUTBOUND] Event:`, {
    connectionId,
    body: event.body,
    timestamp: new Date().toISOString()
  });

  const wsClient = new ApiGatewayManagementApi({
    endpoint: `${domain}/${stage}`,
    apiVersion: '2018-11-29'
  });

  try {
    const {userId} = JSON.parse((event as any).queryStringParameters || '{}');

    const connection = await connectionDao.getConnection(userId);
    if (!connection?.data?.connectionId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Connection not found' })
      };
    }

    await wsClient.postToConnection({
      ConnectionId: connection.data.connectionId,
      Data: JSON.stringify("HELLO FROM OUTBOUND")
    }).promise();

    console.log(`[WEBSOCKET][OUTBOUND] Message sent:`, { userId, targetConnectionId: connection.data.connectionId });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent successfully' })
    };

  } catch (error) {
    console.error(`[WEBSOCKET][OUTBOUND] Error:`, { error, connectionId });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Outbound error: ${error}` })
    };
  }
};