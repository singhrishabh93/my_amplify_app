import 'package:amplify_authenticator/amplify_authenticator.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
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

  static const apiKey = "AIzaSyBKtjPeGSaKa65BEfxxP1e8W29Wgao4Ig0";
  final model = GenerativeModel(model: 'gemini-pro', apiKey: apiKey);
  final List<Message> _messages = [];

  final List<String> predefinedPrompts = [
    "Bold & playful",
    "Suggest an outfit for a summer day",
    "How can I style a black blazer?",
    "Ideas for casual yet chic attire?",
    "What shoes go with beige trousers?"
  ];

  late Timer typingTimer;

  @override
  void initState() {
    super.initState();
    // Typing dots animation
    typingTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      setState(() {
        typingDots = typingDots % 3 + 1; // Cycle through 1, 2, 3 dots
      });
    });
  }

  @override
  void dispose() {
    _userMessage.dispose();
    typingTimer.cancel();
    super.dispose();
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
    });

    final content = [Content.text(message)];
    final response = await model.generateContent(content);

    setState(() {
      isTyping = false;
      _messages.add(Message(
        isUser: false,
        message: response.text ?? "",
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
    });

    final content = [Content.text(message)];
    final response = await model.generateContent(content);

    setState(() {
      isTyping = false;
      _messages.add(Message(
        isUser: false,
        message: response.text ?? "",
        date: DateTime.now(),
      ));
      isLoading = false;
    });
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
              '.' * typingDots, // Display dots dynamically
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
            child: _messages.isEmpty
                ? Center(
                    child: Wrap(
                      spacing: 12.0,
                      runSpacing: 12.0,
                      children: predefinedPrompts.map((prompt) {
                        return GestureDetector(
                          onTap: () => sendPromptMessage(prompt),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(25),
                              border: Border.all(
                                color: const Color(0xFFDDDDDD),
                                width: 1.5,
                              ),
                            ),
                            child: Text(
                              prompt,
                              style: const TextStyle(
                                fontSize: 17,
                                fontFamily: "SatoshiR",
                                color: Colors.black,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  )
                : ListView.builder(
                    itemCount: _messages.length + (isTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length && isTyping) {
                        return buildTypingIndicator();
                      }
                      final message = _messages[index];
                      return Messages(
                        isUser: message.isUser,
                        message: message.message,
                        date: DateFormat('HH:mm').format(message.date),
                        onAnimatedTextFinished: () {},
                      );
                    },
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
