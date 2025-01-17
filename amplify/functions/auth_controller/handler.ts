
import type { APIGatewayProxyHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import * as jwt from "jsonwebtoken";

import outputs from "../../../amplify_outputs.json";
import { UserInfoDao } from "../dao/userInfoDao";

console.log(`=== [AUTH_CONTROLLER] Initializing Auth Controller ===`);
Amplify.configure(outputs);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "30 days";

export const handler: APIGatewayProxyHandler = async (event, context) => {
  console.log("[AUTH_HANDLER] === Starting Auth Controller Handler ===", {
    requestId: context.awsRequestId,
    timestamp: new Date().toISOString(),
  });

  try {
    const { httpMethod, path } = event;
    const userInfoDao = new UserInfoDao();

    // Create Token Route
    if (httpMethod === "POST" && path === "/auth/token") {
      console.log("[AUTH_HANDLER] Creating JWT token");

      const body = JSON.parse(event.body || "{}");
      if (!body.userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "userId is required" }),
        };
      }

      const userId = body.userId;

      console.log("[AUTH_HANDLER] Creating token for userId", { userId });
      // Create JWT token
      const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
      });
      console.log("[AUTH_HANDLER] Token created", { token });

      // Store in UserInfo table
      console.log("[AUTH_HANDLER] Storing token in UserInfo table");

      // check if usesr exists
      // If not create a new user
      // Else update the token

      const userInfo = await userInfoDao.getUserInfoById(userId);
      if (!userInfo?.data) {
        console.log("[AUTH_HANDLER] No user found, creating new user");

        /*
        
        async createUserInfo(
    userId: string,
    userFullName: string,
    userWhatsAppNumber: string,
    userStatus: "NEW" | "ONBOARDED" | "INACTIVE" = "NEW",
    authToken: string
  )
        */

        const createResponse = await userInfoDao.createUserInfo(
          userId,
          body.userFullName || `Guest_User_${userId}`,
          userId,
          "NEW",
          token
        )

        console.log("[AUTH_HANDLER] Token stored in UserInfo table", {
          createResponse,
        });

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Token created successfully",
            token,
          }),
        };


      } else {
        const updateResponse = await userInfoDao.updateUserInfo(userId,{
          token
        })
        console.log("[AUTH_HANDLER] Token stored in UserInfo table", {
          updateResponse,
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Token created successfully",
          token,
        }),
      };
    }

    // Validate Token Route
    if (httpMethod === "POST" && path === "/auth/validate") {
      console.log("[AUTH_HANDLER] Validating token");

      /*
    ### Why Use the Authorization Header Instead of the Body?

        1. **Standard Practice**: Using the Authorization header is a standard practice for passing tokens in HTTP requests. This is defined in the HTTP specification and is widely adopted.

        2. **Security**: Sending tokens in headers can be more secure than sending them in the body. Headers are less likely to be logged or cached compared to the body content.

        3. **Convenience**: Many frameworks and libraries expect tokens to be in the 


        GET /protected-resource HTTP/1.1
        Host: example.com
        Authorization: Bearer your_token_here
    */

      const authHeader = event.headers.Authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("[AUTH_HANDLER] No token provided", { authHeader });
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "No token provided" }),
        };
      }

      const token = authHeader.split(" ")[1];

      try {
        // Verify JWT

        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        if (!decoded || !decoded.userId) {
          console.error("[AUTH_HANDLER] Invalid token payload", decoded);
          return {
            statusCode: 401,
            body: JSON.stringify({ message: "Invalid token payload" }),
          };
        }

        // THIS PART IS JUST AN EXTRA CHECK CAN BE REMOVED TO IMPROVE RESPONSE TIME
        const userInfo = await userInfoDao.getUserInfoById(decoded.userId);

        if (!userInfo?.data || userInfo.data.authToken !== token) {
          console.error("[AUTH_HANDLER] No User or No Token in DDB", {
            userInfo,
            token,
          });
          return {
            statusCode: 401,
            body: JSON.stringify({ message: "No User Found" }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Token is valid",
          }),
        };
      } catch (error) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid or expired token" }),
        };
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
    };
  } catch (error) {
    console.error("[AUTH_HANDLER_ERROR]", {
      error,
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal Server Error: ${error}`,
      }),
    };
  }
};
