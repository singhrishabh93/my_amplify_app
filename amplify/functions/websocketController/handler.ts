// import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
// import { ApiGatewayManagementApi } from "aws-sdk";
// import { ConnectionDao } from "../dao/connectionDao";
// import { Amplify } from "aws-amplify";
// import outputs from "../../../amplify_outputs.json";
// Amplify.configure(outputs);

// export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
//   const domain = event.requestContext.domainName;
//   const stage = event.requestContext.stage;
//   const connectionId = event.requestContext.connectionId;
//   const connectionDao = new ConnectionDao();
//   const queryParams = (event as any).queryStringParameters;

//   console.log(`[WEBSOCKET][EVENT] : Incoming event: ${JSON.stringify(event)}`);

//   const wsClient = new ApiGatewayManagementApi({
//     endpoint: `${domain}/${stage}`,
//   });

//   switch (event.requestContext.routeKey) {
//     case "$connect":
//       try {
//         //NTOE : ALSO FIND IF THE USER EXISTS
//         console.log(
//           `[WEBSOCKET][CONNECT] : Establishing connection with connectionId: ${connectionId}`
//         );
//         const userId = queryParams?.userId;
//         console.log(`[WEBSOCKET][CONNECT] : User Id: ${userId}`);
//         if (!userId) {
//           console.error(
//             `[WEBSOCKET][CONNECT] : User Id not found for connectionId: ${connectionId}`
//           );
//           return {
//             statusCode: 400,
//             message: `User Id not found for connectionId: ${connectionId}`,
//           };
//         }
//         await connectionDao.createConnection(
//           connectionId,
//           userId,
//           Date.now().toString()
//         );
//         console.log(
//           `[WEBSOCKET][CONNECT] : Connection established with connectionId: ${connectionId}`
//         );
//         return { statusCode: 200 };
//       } catch (error) {
//         console.error(
//           `[WEBSOCKET][CONNECT] : Error establishing connection with connectionId: ${connectionId}`,
//           error
//         );
//         return {
//           statusCode: 500,
//           message: `Error establishing connection with connection id : ${connectionId}`,
//         };
//       }

//     case "$disconnect":
//       try {
//         console.log(
//           `[WEBSOCKET][DISCONNECT] : Disconnecting connection with connectionId: ${connectionId}`
//         );
//         await connectionDao.deleteConnection(connectionId);
//         console.log(
//           `[WEBSOCKET][DISCONNECT] : Connection disconnected with connectionId: ${connectionId}`
//         );
//         return {
//           statusCode: 200,
//           message: `Connection disconnected with connectionId: ${connectionId}`,
//         };
//       } catch (error) {
//         console.error(
//           `[WEBSOCKET][DISCONNECT] : Error disconnecting connection with connectionId: ${connectionId}`,
//           error
//         );
//         return {
//           statusCode: 500,
//           message: `Error disconnecting connection with connection id : ${connectionId}`,
//         };
//       }

//       case "$default":
//       try {
//         console.log(
//           `[WEBSOCKET][DEFAULT] : Received default message from connectionId: ${connectionId}`
//         );
//         return { statusCode: 200 };
//       } catch (error) {
//         console.error(
//           `[WEBSOCKET][DEFAULT] : Error processing default message from connectionId: ${connectionId}`,
//           error
//         );
//         return {
//           statusCode: 500,
//           message: `Error processing default message from connection id : ${connectionId}`,
//         };
//       }

//     case "inbound":
//       try {
//         console.log(
//           `[WEBSOCKET][MESSAGE] : Received message from connectionId: ${connectionId}`
//         );
//         const { message, userId } = JSON.parse(event.body || "{}");
//         // send connectionId ,userid, message to ai agent
//         // send message to ai agent
//         return { statusCode: 200 };
//       } catch (error) {
//         console.error(
//           `[WEBSOCKET][MESSAGE] : Error processing message from connectionId: ${connectionId}`,
//           error
//         );
//         return {
//           statusCode: 500,
//           message: `Error processing message from connection id : ${connectionId}`,
//         };
//       }

//     case "outbound":
//       try {
//         //find connectionId from userId
//         const { userId, message } = JSON.parse(event.body || "{}");
//         console.log(
//           `[WEBSOCKET][OUTBOUND] : Sending message to UserId: ${userId}`
//         );
//         const connection = await connectionDao.getConnection(userId);
//         if (!connection) {
//           console.error(
//             `[WEBSOCKET][OUTBOUND] : Connection not found for userId: ${userId}`
//           );
//           return {
//             statusCode: 404,
//             message: `Connection not found for userId: ${userId}`,
//           };
//         }
//         const connectionId = connection.data?.connectionId;
//         if (!connectionId) {
//           console.error(
//             `[WEBSOCKET][OUTBOUND] : ConnectionId not found for userId: ${userId}`
//           );
//           return {
//             statusCode: 404,
//             message: `ConnectionId not found for userId: ${userId}`,
//           };
//         }
//         await sendMessage(wsClient, connectionId, message);
//         console.log(
//           `[WEBSOCKET][OUTBOUND] : Message sent to UserId: ${userId}`
//         );
//       } catch (error) {
//         console.error(
//           `[WEBSOCKET][OUTBOUND] : Error sending message to connectionId: ${connectionId}`,
//           error
//         );
//         return {
//           statusCode: 500,
//           message: `Error sending message to connection id : ${connectionId}`,
//         };
//       }
//   }

//   return {
//     statusCode: 400,
//     message: `Invalid route: ${event.requestContext.routeKey}`,
//   };
// };

// async function sendMessage(
//   wsClient: ApiGatewayManagementApi,
//   connectionId: string,
//   message: string
// ) {
//   try {
//     console.log(
//       `[WEBSOCKET][OUTBOUND] : Sending message to connectionId: ${connectionId}`
//     );
//     await wsClient
//       .postToConnection({
//         ConnectionId: connectionId,
//         Data: message,
//       })
//       .promise();
//     console.log(
//       `[WEBSOCKET][OUTBOUND] : Message sent to connectionId: ${connectionId}`
//     );
//   } catch (error) {
//     console.error(
//       `[WEBSOCKET][OUTBOUND] : Error sending message to connectionId: ${connectionId}`,
//       error
//     );
//     throw error;
//   }
// }
