import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

import '../models/message.dart';
import '../models/messages.dart';
import '../utils/size.dart';
import '../utils/style.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  TextEditingController _userMessage = TextEditingController();
  bool isLoading = false;

  static const apiKey = "AIzaSyBKtjPeGSaKa65BEfxxP1e8W29Wgao4Ig0";

  final List<Message> _messages = [];

  final model = GenerativeModel(model: 'gemini-pro', apiKey: apiKey);

  void sendMessage() async {
    final message = _userMessage.text;
    _userMessage.clear();

    setState(() {
      _messages.add(Message(
        isUser: true,
        message: message,
        date: DateTime.now(),
      ));
      isLoading = true;
    });

    final content = [Content.text(message)];
    final response = await model.generateContent(content);

    setState(() {
      _messages.add(Message(
        isUser: false,
        message: response.text ?? "",
        date: DateTime.now(),
      ));
    });
  }

  void onAnimatedTextFinished() {
    setState(() {
      isLoading = false;
    });
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
            color: Color(0xffDDDDDD),
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
                  color: Color(0xff1f1f1f),
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  fontFamily: "SatoshiR"),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.refresh_rounded,
              color: Colors.black,
            ),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return Messages(
                  isUser: message.isUser,
                  message: message.message,
                  date: DateFormat('HH:mm').format(message.date),
                  onAnimatedTextFinished: onAnimatedTextFinished,
                  // onAnimatedTextFinished: onAnimatedTextFinished,
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
                    color:
                        const Color(0xFFF5F5F5), // Lighter gray to match image
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: TextFormField(
                    maxLines: 1,
                    minLines: 1,
                    controller: _userMessage,
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
                      prefixIcon: Container(
                        padding: const EdgeInsets.all(14),
                        child: const Icon(
                          Icons.add, // Changed to plus icon
                          color: Color(0xFF1f1f1f),
                          size: 24,
                        ),
                      ),
                      suffixIcon: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (isLoading)
                              Container(
                                width: 24,
                                height: 24,
                                margin: const EdgeInsets.only(right: 16),
                                child: const CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.black),
                                  strokeWidth: 2,
                                ),
                              )
                            else
                              IconButton(
                                icon: const Icon(
                                  Icons.send_rounded, // Changed to send icon
                                  color: Color(0xFF1f1f1f),
                                  size: 24,
                                ),
                                onPressed: () {
                                  if (_userMessage.text.isNotEmpty) {
                                    sendMessage();
                                  }
                                },
                              ),
                          ],
                        ),
                      ),
                    ),
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                    ),
                    onChanged: (value) {
                      setState(() {});
                    },
                    onFieldSubmitted: (value) {
                      if (!isLoading && _userMessage.text.isNotEmpty) {
                        sendMessage();
                      }
                    },
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
