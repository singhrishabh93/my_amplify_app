import 'package:amplify_authenticator/amplify_authenticator.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:my_amplify_app/main.dart';
import 'dart:async';

import '../models/message.dart';
import '../models/messages.dart';
import '../utils/size.dart';
import '../utils/style.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _userMessage = TextEditingController();
  bool isLoading = false;
  bool isTyping = false;
  int typingDots = 1;
  bool showPredefinedPrompts = true;
  bool hasUserSentFirstMessage = false;

  final String apiEndpoint =
      "https://287eiurk59.execute-api.us-east-1.amazonaws.com/dev/gateway";
  final List<Message> _messages = [];

  final List<Map<String, dynamic>> predefinedPrompts = [
    {"icon": "🛍️", "text": "I have a party this Friday night, suggest fits!"},
    {
      "icon": "☔️",
      "text": "It's raining outside, what should I wear to my office?"
    },
    {
      "icon": "👗",
      "text": "Can you help me pair up a dress? Here's a picture of it"
    },
  ];

  late Timer typingTimer;

  Future<String> sendMessageToAPI(String messageContent) async {
    try {
      final response = await http.post(
        Uri.parse(apiEndpoint),
        headers: {
          'Content-Type': 'application/json',
        },
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
        return jsonResponse['maissResult']['data']['message'] ??
            "No response message";
      } else {
        return "Error: Unable to get response";
      }
    } catch (e) {
      return "Error: $e";
    }
  }

  void sendPromptMessage(String message) async {
    setState(() {
      _messages.add(Message(
        isUser: true,
        message: message,
        date: DateTime.now(),
      ));
      isLoading = true;
      isTyping = true;
      hasUserSentFirstMessage = true;
      showPredefinedPrompts = false;
    });

    final response = await sendMessageToAPI(message);

    setState(() {
      isTyping = false;
      _messages.add(Message(
        isUser: false,
        message: response,
        date: DateTime.now(),
      ));
      isLoading = false;
    });
  }

  void sendManualMessage() async {
    final message = _userMessage.text;
    if (message.isEmpty) return;

    _userMessage.clear();

    setState(() {
      _messages.add(Message(
        isUser: true,
        message: message,
        date: DateTime.now(),
      ));
      isLoading = true;
      isTyping = true;
      hasUserSentFirstMessage = true;
      showPredefinedPrompts = false;
    });

    final response = await sendMessageToAPI(message);

    setState(() {
      isTyping = false;
      _messages.add(Message(
        isUser: false,
        message: response,
        date: DateTime.now(),
      ));
      isLoading = false;
    });
  }

  @override
  void initState() {
    super.initState();

    // Add listener for text changes
    _userMessage.addListener(() {
      setState(() {
        // Only show prompts if user hasn't sent their first message
        if (!hasUserSentFirstMessage) {
          showPredefinedPrompts = _userMessage.text.isEmpty;
        }
      });
    });

    // Add static first welcome message when the screen is initialized
    _messages.add(Message(
      isUser: false,
      message: "Hey ✨\nHow are you doing?",
      date: DateTime.now(),
    ));

    // Typing dots animation
    typingTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      setState(() {
        typingDots = typingDots % 3 + 1;
      });
    });
  }

  @override
  void dispose() {
    _userMessage.dispose();
    typingTimer.cancel();
    super.dispose();
  }

  Widget buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 5,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              '.' * typingDots,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black54,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,
      appBar: AppBar(
        scrolledUnderElevation: 0,
        toolbarHeight: 75,
        backgroundColor: Colors.white,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: const Color(0xffDDDDDD),
            height: 1.0,
          ),
        ),
        title: Row(
          children: [
            IconButton(
              icon: const Icon(
                Icons.arrow_back_ios,
                color: Colors.black,
                size: 29,
              ),
              onPressed: () {},
            ),
            Image.asset(
              'assets/monova.png',
              height: 38,
              width: 38,
            ),
            const SizedBox(width: 10),
            Text(
              'AI Stylist',
              style: TextStyle(
                color: const Color(0xff1f1f1f),
                fontSize: 17,
                fontWeight: FontWeight.w700,
                fontFamily: "SatoshiB",
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.logout_outlined,
              color: Colors.black,
            ),
            onPressed: () async {
              try {
                await Amplify.Auth.signOut();
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (context) => const MyApp(),
                  ),
                );
              } catch (e) {
                safePrint('Sign-out failed: $e');
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                ListView.builder(
                  itemCount: _messages.length + (isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length && isTyping) {
                      return buildTypingIndicator();
                    }
                    final message = _messages[index];
                    return GestureDetector(
                      onLongPress: !message.isUser
                          ? () {
                              showModalBottomSheet(
                                context: context,
                                builder: (BuildContext context) {
                                  return Container(
                                    height: 120,
                                    child: Column(
                                      children: [
                                        ListTile(
                                          leading: Icon(Icons.copy),
                                          title: Text('Copy'),
                                          onTap: () {
                                            Clipboard.setData(ClipboardData(
                                                text: message.message));
                                            Navigator.pop(context);
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(
                                              SnackBar(
                                                  content: Text(
                                                      'Message copied to clipboard')),
                                            );
                                          },
                                        ),
                                        ListTile(
                                          leading:
                                              Icon(Icons.check_circle_outline),
                                          title: Text('Select'),
                                          onTap: () {
                                            Navigator.pop(context);
                                            showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return AlertDialog(
                                                  content: SelectableText(
                                                    message.message,
                                                    style: TextStyle(
                                                      fontSize: 16,
                                                      fontFamily: "SatoshiR",
                                                    ),
                                                    toolbarOptions: ToolbarOptions(
                                                      copy: true,
                                                      selectAll: true,
                                                      cut: false,
                                                      paste: false,
                                                    ),
                                                  ),
                                                  actions: [
                                                    TextButton(
                                                      onPressed: () =>
                                                          Navigator.pop(context),
                                                      child: Text('Close'),
                                                    ),
                                                  ],
                                                );
                                              },
                                            );
                                          },
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              );
                            }
                          : null,
                      child: Messages(
                        isUser: message.isUser,
                        message: message.message,
                        date: DateFormat('HH:mm').format(message.date),
                        onAnimatedTextFinished: () {},
                      ),
                    );
                  },
                ),
                if (_messages.length == 1 && showPredefinedPrompts)
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: predefinedPrompts.map((prompt) {
                          return GestureDetector(
                            onTap: () => sendPromptMessage(prompt['text']),
                            child: IntrinsicWidth(
                              child: Container(
                                margin: const EdgeInsets.symmetric(vertical: 8),
                                padding: const EdgeInsets.all(16),
                                constraints: BoxConstraints(
                                  maxWidth:
                                      MediaQuery.of(context).size.width * 0.7,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: const BorderRadius.only(
                                    topLeft: Radius.circular(18),
                                    bottomLeft: Radius.circular(18),
                                    bottomRight: Radius.circular(0),
                                    topRight: Radius.circular(18),
                                  ),
                                  border: Border.all(
                                      color: const Color(0xffA99AFF)),
                                ),
                                child: Row(
                                  children: [
                                    Text(
                                      prompt['icon'],
                                      style: const TextStyle(
                                        fontSize: 30,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        prompt['text'],
                                        style: const TextStyle(
                                          fontSize: 17,
                                          fontWeight: FontWeight.w500,
                                          fontFamily: "SatoshiR",
                                        ),
                                        softWrap: true,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Column(
            children: [
              const Divider(
                height: 1,
                thickness: 1,
                color: Color(0xFFEEEEEE),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: medium, vertical: small),
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F5),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: TextFormField(
                    maxLines: 1,
                    minLines: 1,
                    controller: _userMessage,
                    enabled: !isLoading,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: const Color(0xFFF5F5F5),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 16,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(25),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(25),
                        borderSide: BorderSide.none,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(25),
                        borderSide: BorderSide.none,
                      ),
                      hintText: 'Type your message here...',
                      hintStyle: const TextStyle(
                        color: Color(0xFF9B9B9B),
                        fontSize: 16,
                        fontFamily: "SatoshiR",
                      ),
                      prefixIcon: const Icon(
                        Icons.add,
                        color: Color(0xFF1f1f1f),
                        size: 24,
                      ),
                      suffixIcon: IconButton(
                        icon: const Icon(
                          Icons.send_rounded,
                          size: 24,
                        ),
                        color: _userMessage.text.isNotEmpty
                            ? const Color(0xFF1f1f1f)
                            : const Color(0xFF9B9B9B),
                        onPressed: _userMessage.text.isEmpty || isLoading
                            ? null
                            : sendManualMessage,
                      ),
                    ),
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                      fontFamily: "SatoshiR",
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}