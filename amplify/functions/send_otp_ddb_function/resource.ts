import { defineFunction } from "@aws-amplify/backend";

export const sendOtpDdbFcuntion = defineFunction({
  name: "SEND_OTP_DDB_FUNCTION",
  resourceGroupName: "auth",
});