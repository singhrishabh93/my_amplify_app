// lib/pages/chat_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import '../services/chat_service.dart';
import '../models/message.dart';
import '../widgets/chat_input.dart';
import '../widgets/chat_message.dart';
import '../widgets/typing_indicator.dart';
import '../widgets/prompt_button.dart';
import '../constants/predefined_prompts.dart';
import '../utils/style.dart';
import 'package:my_amplify_app/main.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _userMessage = TextEditingController();
  final List<Message> _messages = [];
  bool isLoading = false;
  bool isTyping = false;
  int typingDots = 1;
  bool showPredefinedPrompts = true;
  bool hasUserSentFirstMessage = false;
  late Timer typingTimer;

  @override
  void initState() {
    super.initState();
    _initializeChat();
    _setupTypingTimer();
    _setupMessageListener();
  }

  void _initializeChat() {
    setState(() {
      _messages.add(Message(
        isUser: false,
        message: "Hey ✨\nHow are you doing?",
        date: DateTime.now(),
      ));
    });
  }

  void _setupTypingTimer() {
    typingTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      setState(() {
        typingDots = typingDots % 3 + 1;
      });
    });
  }

  void _setupMessageListener() {
    _userMessage.addListener(() {
      if (!hasUserSentFirstMessage) {
        setState(() {
          showPredefinedPrompts = _userMessage.text.isEmpty;
        });
      }
    });
  }

  Future<void> _sendMessage(String message) async {
    if (message.isEmpty) return;

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

    final response = await ChatService.sendMessage(message);

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

  void _showMessageOptions(BuildContext context, Message message) {
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
                  Clipboard.setData(ClipboardData(text: message.message));
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Message copied to clipboard')),
                  );
                },
              ),
              ListTile(
                leading: Icon(Icons.check_circle_outline),
                title: Text('Select'),
                onTap: () {
                  Navigator.pop(context);
                  _showSelectableText(context, message);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSelectableText(BuildContext context, Message message) {
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
              onPressed: () => Navigator.pop(context),
              child: Text('Close'),
            ),
          ],
        );
      },
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
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
            onPressed: () => Navigator.pop(context),
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
    );
  }

  Widget _buildPromptList() {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        height: 90,
        margin: const EdgeInsets.symmetric(vertical: 16.0),
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          itemCount: predefinedPrompts.length,
          itemBuilder: (context, index) {
            final prompt = predefinedPrompts[index];
            return PromptButton(
              icon: prompt['icon'],
              text: prompt['text'],
              onTap: () => _sendMessage(prompt['text']),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                ListView.builder(
                  itemCount: _messages.length + (isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _messages.length && isTyping) {
                      return TypingIndicator(typingDots: typingDots);
                    }
                    final message = _messages[index];
                    return ChatMessage(
                      isUser: message.isUser,
                      message: message.message,
                      date: DateFormat('HH:mm').format(message.date),
                      onAnimatedTextFinished: () {},
                      // onLongPress: !message.isUser 
                      //     ? (context) => _showMessageOptions(context, message)
                      //     : (_) {},
                    );
                  },
                ),
                if (_messages.length == 1 && showPredefinedPrompts)
                  _buildPromptList(),
              ],
            ),
          ),
          ChatInput(
            controller: _userMessage,
            isLoading: isLoading,
            onSend: () {
              final message = _userMessage.text;
              _userMessage.clear();
              _sendMessage(message);
            },
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _userMessage.dispose();
    typingTimer.cancel();
    super.dispose();
  }
}