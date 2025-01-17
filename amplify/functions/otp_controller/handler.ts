
import type { APIGatewayProxyHandler } from "aws-lambda";
import { AxiosClient } from "../integrations/axiosClient";
import { Amplify } from "aws-amplify";
import { OTPRecordDao } from "../dao/otpRecordDao";

import outputs from "../../../amplify_outputs.json";

console.log(`=== [OTP_CONTROLLER] Initializing OTP Controller ===`);
console.log(`[OTP_CONTROLLER] Initializing Amplify with outputs`);

Amplify.configure(outputs);

export const handler: APIGatewayProxyHandler = async (event, context) => {
  console.log("[OTP_HANDLER] === Starting OTP Controller Handler ===", {
    requestId: context.awsRequestId,
    timestamp: new Date().toISOString(),
  });

  try {
    const { httpMethod, path, pathParameters, queryStringParameters, body } =
      event;

    // Generate client
    const client  = new OTPRecordDao();

    if (!queryStringParameters || !queryStringParameters.phoneNumber) {
      console.log("[OTP_HANDLER] Phone number missing in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Phone number is required" }),
      };
    }

    const phoneNumber = queryStringParameters?.phoneNumber;

    console.log("[OTP_HANDLER]Request details:", {
      httpMethod,
      path,
      pathParameters,
      queryStringParameters,
      body: body ? JSON.parse(body) : null,
    });

    // API ROUTES : /dev/otp/*
    //API METHODS

    if (httpMethod === "GET" && path === "/otp/create") {
      console.log("[OTP_HANDLER] Generating OTP");
      // should be a part of service
      const { otp, expiresAt } = createDetails();
      console.log("[OTP_HANDLER] Generated OTP", { otp, expiresAt });


      // Check and delete existing record
      console.log("[OTP_GENERATOR] Deleting existing record for:", phoneNumber);

      try {
        await client.deleteOTPRecord(phoneNumber);
      } catch (error) {
        console.log(
          "[OTP_GENERATOR] No existing record found for:",
          phoneNumber
        );
      }

      // Create record
      console.log(`[OTP_GENERATOR]Creating OTP record.`, {
        phoneNumber,
        otp,
        expiresAt,
        typeExpiry: typeof expiresAt,
      });
      const result = await client.createOTPRecord(phoneNumber,otp,expiresAt,0);
      console.log("[OTP_GENERATOR] OTP record created", result);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `[OTP_HANDLER] :OTP generated successfully : ${otp}`,
        }),
      };
    }

    if (httpMethod === "POST" && path === "/otp/verify") {
      console.log("[OTP_HANDLER] Verifying OTP");
      const client_otp = event.queryStringParameters?.otp;
      if (!client_otp) {
        console.log("[OTP_HANDLER] OTP missing in request");
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "OTP is required" }),
        };
      }

      // should be a part of service
      //Fetching OTP record
      const otpRecord = await client.getOTPRecord(phoneNumber);

      if (!otpRecord?.data) {
        console.log("[OTP_HANDLER] No OTP record found:", { phoneNumber });
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "No OTP found for this number" }),
        };
      }

      console.log("[OTP_HANDLER] OTP Record fetched", otpRecord);

      if (!otpRecord.data.expiresAt || !otpRecord.data.otp) {
        console.log("[OTP_HANDLER] OTP Record invalid", otpRecord);
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid OTP Record" }),
        };
      }
      const ddb_otp = otpRecord.data.otp;
      const ddb_expiresAt = otpRecord.data.expiresAt;

      if (ddb_expiresAt < Math.floor(Date.now() / 1000)) {
        console.log("[OTP_HANDLER] OTP expired", otpRecord);
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "OTP has expired" }),
        };
      }

      if (client_otp !== ddb_otp) {
        console.log("[OTP_HANDLER] Invalid OTP", otpRecord);
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid OTP" }),
        };
      }

      console.log("[OTP_HANDLER] OTP Verified", otpRecord);

      // Delete Record
      console.log("[OTP_HANDLER] Deleting OTP record for:", phoneNumber);
      await client.deleteOTPRecord(phoneNumber);

      // NOTE : FETCH TOKEN FROM /auth/token
      const authBaseUrl = (outputs.custom.API.authApi.endpoint as string) || "";
      // const authBaseUrl = process.env.AUTH_API_ENDPOINT || "";
      const authClient = AxiosClient.getInstance(authBaseUrl).getClient();

      console.log("[OTP_HANDLER] Fetching token from auth service", );
      const response = await authClient.post("/auth/token", {
        userId: phoneNumber,
      });

      console.log("[OTP_HANDLER] Token response", response.data);
      if (!response.data.token) {
        console.error("[OTP_HANDLER] Token not generated", response.data);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: `[OTP_HANDLER] : Token not generated : ${response.data.message}`,
          }),
        };
      }

      console.log("[OTP_HANDLER] Token generated", response.data);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `[OTP_HANDLER] :OTP verified successfully : ${event.queryStringParameters?.otp}`,
          token: response.data.token,
        }),
      };
    }
    console.warn("No matching route found:", { httpMethod, path });
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Not found" }),
    };
  } catch (error) {
    console.error(`[OTP_HANDLER_ERROR]`, {
      error,
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `[OTP_HANDLER] : Internal Server Error : ${error}`,
      }),
    };
  }
};

const createDetails = () => {
  // USE ROBUST METHODS TO CREATE OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Fetch form env
  // ,10 in parst int specifies the base
  const TIME_TO_LIVE = process.env.TIME_TO_LIVE
    ? parseInt(process.env.TIME_TO_LIVE, 10)
    : 300000;

  const expiresAt = Math.floor((Date.now() + TIME_TO_LIVE) / 1000);
  return { otp, expiresAt };
};
