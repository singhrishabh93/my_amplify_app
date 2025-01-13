// lib/services/chat_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ChatService {
  static const String apiEndpoint = "https://287eiurk59.execute-api.us-east-1.amazonaws.com/dev/gateway";

  static Future<String> sendMessage(String messageContent) async {
    try {
      final response = await http.post(
        Uri.parse(apiEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "userId": "+918837671812",
          "userFullName": "Ankur",
          "userWhatsAppNumber": "+918837671812",
          "messageId": "wamid.123456789",
          "messageType": "INTERACTIVE",
          "messageDirection": "INBOUND",
          "messageContent": messageContent,
          "messageContext": "any"
        }),
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        return jsonResponse['maissResult']['data']['message'] ?? "No response message";
      }
      return "Error: Unable to get response";
    } catch (e) {
      return "Error: $e";
    }
  }
}