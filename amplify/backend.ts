import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";

import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { EventSourceMapping, StartingPosition } from "aws-cdk-lib/aws-lambda";

import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { otpController } from "./functions/otp_controller/resource";
import { authController } from "./functions/auth_controller/resource";
import { sendOtpDdbFcuntion } from "./functions/send_otp_ddb_function/resource";
// import { websocketController } from "./functions/websocketController/resource";
import { connectController } from "./functions/websocketController/connect/resource";
import { disconnectController } from "./functions/websocketController/disconnect/resource";
import { inboundController } from "./functions/websocketController/inbound/resource";
import { outboundController } from "./functions/websocketController/outbound/resource";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
// ...existing backend definition...
const backend = defineBackend({
  auth,
  data,
  otpController,
  authController,
  sendOtpDdbFcuntion,
  inboundController,
  outboundController,
  connectController,
  disconnectController,
});
const apiStack = backend.createStack("demo-api-stack");

// Create WebSocket API
const wsApi = new WebSocketApi(apiStack, "WebSocketApi", {
  apiName: "chatSocket",
  routeSelectionExpression: "$request.body.action",
});

//Create websocket stage
const wsStage = new WebSocketStage(apiStack, "WebSocketStage", {
  webSocketApi: wsApi,
  stageName: "dev",
  autoDeploy: true,
});

const ws_connect_intergration = new WebSocketLambdaIntegration(
  "connectIntegration",
  backend.connectController.resources.lambda
)

const ws_disconnect_intergration = new WebSocketLambdaIntegration(
  "disconnectIntegration",
  backend.disconnectController.resources.lambda
)

const ws_inbound_integration = new WebSocketLambdaIntegration(
  "inboundIntegration",
  backend.inboundController.resources.lambda
);

const ws_outbound_integration = new WebSocketLambdaIntegration(
  "outboundIntegration",
  backend.outboundController.resources.lambda
);


wsApi.addRoute("$connect", {
  integration: ws_connect_intergration,
  
});

wsApi.addRoute("$disconnect", {
  integration: ws_disconnect_intergration,
});

wsApi.addRoute("inbound", {
  integration: ws_inbound_integration,
});

wsApi.addRoute("outbound", {
  integration: ws_outbound_integration,
});



// Create general WebSocket API permissions
const wsPolicy = new Policy(apiStack, "WebSocketPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "execute-api:Invoke",
        "execute-api:ManageConnections",
        "apigateway:*"
      ],
      resources: [
        `*`,
      ]
    }),
  ]
});

backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(wsPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(wsPolicy);

// Create OTP API
const otpApi = new RestApi(apiStack, "OtpApi", {
  restApiName: "otpApi",
  deploy: true,
  deployOptions: { stageName: "dev" },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

// Lambda Integrations
const otpIntegration = new LambdaIntegration(
  backend.otpController.resources.lambda
);

// API Routes
const otpPath = otpApi.root.addResource("otp", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});

otpPath.addMethod("GET", otpIntegration);
otpPath.addMethod("POST", otpIntegration);

otpPath.addProxy({
  anyMethod: true,
  defaultIntegration: otpIntegration,
});

// Auth API
const authApi = new RestApi(apiStack, "AuthApi", {
  restApiName: "authApi",
  deploy: true,
  deployOptions: { stageName: "dev" },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

const authIntegration = new LambdaIntegration(
  backend.authController.resources.lambda
);

const authPath = authApi.root.addResource("auth", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});

authPath.addProxy({
  anyMethod: true,
  defaultIntegration: authIntegration,
});

authPath.addMethod("POST", authIntegration);
authPath.addMethod("GET", authIntegration);

// Set up DDB Stream
const otpTable = backend.data.resources.tables["OTPRecord"];
const streamPolicy = new Policy(Stack.of(otpTable), "OtpStreamPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams",
        "sns:Publish",
      ],
      resources: ["*"],
    }),
  ],
});

// Attach policy to OTP sender Lambda
backend.sendOtpDdbFcuntion.resources.lambda.role?.attachInlinePolicy(
  streamPolicy
);

// Create DDB Stream mapping
const streamMapping = new EventSourceMapping(
  Stack.of(otpTable),
  "OtpStreamMapping",
  {
    target: backend.sendOtpDdbFcuntion.resources.lambda,
    eventSourceArn: otpTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

streamMapping.node.addDependency(streamPolicy);

// Add OTP API to policy resources
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        // ...existing resources...
        `${otpApi.arnForExecuteApi("*", "/", "dev")}`,
        `${otpApi.arnForExecuteApi("*", "/otp/*", "dev")}`,
        `${authApi.arnForExecuteApi("*", "/", "dev")}`,
        `${authApi.arnForExecuteApi("*", "/auth/*", "dev")}`,
      ],
    }),
  ],
});

backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

// Add OTP API outputs
backend.addOutput({
  custom: {
    API: {
      // ...existing APIs...
      [otpApi.restApiName]: {
        endpoint: otpApi.url,
        region: Stack.of(otpApi).region,
        apiName: otpApi.restApiName,
      },
      [authApi.restApiName]: {
        endpoint: authApi.url,
        region: Stack.of(authApi).region,
        apiName: authApi.restApiName,
      },
    },
  },
});
