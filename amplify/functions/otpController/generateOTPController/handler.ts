import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../../data/resource";
import type { APIGatewayProxyHandler } from "aws-lambda";
import outputs from "../../../../amplify_outputs.json";
import { Amplify } from "aws-amplify";

console.log(
  "Initializing Amplify with outputs:",
  JSON.stringify(outputs, null, 2)
);
Amplify.configure(outputs);

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    const phoneNumber = event.queryStringParameters?.phoneNumber;
    console.log("Phone number from query:", phoneNumber);

    if (!phoneNumber) {
      console.log("Phone number missing in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Phone number is required" }),
      };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Math.floor(Date.now() / 1000) + 2 * 60 * 1000;
    const ttl = Math.floor(Date.now() / 1000) + 180; // 3 minutes in Unix timestamp

    console.log("Generated values:", { otp, expiresAt, ttl });

    // Verify schema exists
    const client = generateClient<Schema>();
    console.log("Client generated, checking schema...");
    console.log("Available models:", Object.keys(client.models));

    if (!client.models.OTPRecord) {
      throw new Error("OTPRecord schema not found");
    }

    // Create record
    console.log("Creating OTP record...");
    const result = await client.models.OTPRecord.create({
      phoneNumber: phoneNumber,
      otp: otp,
      expiresAt: expiresAt,
      ttl: ttl,
      verified: false,
      attempts: 0,
    });

    console.log("OTP record created:", JSON.stringify(result, null, 2));

    // Verify record exists
    const verifyRecord = await client.models.OTPRecord.get({
      phoneNumber,
    });
    console.log(
      "Verification query result:",
      JSON.stringify(verifyRecord, null, 2)
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "OTP generated successfully",
        phoneNumber,
        recordCreated: !!verifyRecord,
      }),
    };
  } catch (error) {
    console.error("[OTP_GENERATOR_ERROR] Unhandled Error:", {
      error,
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
