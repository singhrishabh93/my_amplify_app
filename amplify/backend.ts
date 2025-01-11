import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { EventSourceMapping, StartingPosition } from "aws-cdk-lib/aws-lambda";

import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { generateOTPController } from "./functions/otpController/generateOTPController/resource";
import { sendOtpDdbFcuntion } from "./functions/otpController/sendOtpDdbFcuntion/resource";
import { verifyOTPController } from "./functions/otpController/verifyOTPController/resource";
// ...existing backend definition...
const backend = defineBackend({
  auth,
  data,
  generateOTPController,
  sendOtpDdbFcuntion,
  verifyOTPController,
  // ...other existing controllers
});

const { cfnResources } = backend.data.resources;

cfnResources.amplifyDynamoDbTables['OTPRecord'].timeToLiveAttribute = {
  attributeName: "ttl",
  enabled: true,
};


const apiStack = backend.createStack("demo-api-stack");

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
const otpGenIntegration = new LambdaIntegration(
  backend.generateOTPController.resources.lambda
);
const otpVerifyIntegration = new LambdaIntegration(
  backend.verifyOTPController.resources.lambda
);



// API Routes
const otpPath = otpApi.root.addResource("otp" , {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});
const generatePath = otpPath.addResource("generate" , {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});
const verifyPath = otpPath.addResource("verify" , {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});

generatePath.addMethod("POST", otpGenIntegration);
verifyPath.addMethod("POST", otpVerifyIntegration);

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
    },
  },
});
