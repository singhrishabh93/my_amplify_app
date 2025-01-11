import { defineFunction } from "@aws-amplify/backend";

export const sendOtpDdbFcuntion = defineFunction({
  name: "sendOtpDdbFcuntion",
  resourceGroupName: "auth",
});