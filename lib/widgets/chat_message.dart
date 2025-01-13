// lib/widgets/chat_message.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:my_amplify_app/widgets/message_actions.dart';
import '../utils/size.dart';
import '../utils/style.dart';


class ChatMessage extends StatelessWidget {
  final bool isUser;
  final String message;
  final String date;
  final Function onAnimatedTextFinished;
  final Function(BuildContext) onLongPress;
  final isAnimated = ValueNotifier(false);

  ChatMessage({
    Key? key,
    required this.isUser,
    required this.message,
    required this.date,
    required this.onAnimatedTextFinished,
    required this.onLongPress,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () => onLongPress(context),
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Align(
            alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
            child: IntrinsicWidth(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.95,
                ),
                child: Container(
                  padding: const EdgeInsets.all(small),
                  margin: const EdgeInsets.symmetric(vertical: small).copyWith(
                    left: isUser ? 100 : xsmall,
                    right: isUser ? xsmall : 100,
                  ),
                  decoration: BoxDecoration(
                    color: isUser ? userChat : resChat,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      bottomLeft: isUser ? const Radius.circular(18) : Radius.zero,
                      topRight: const Radius.circular(18),
                      bottomRight: !isUser ? const Radius.circular(18) : Radius.zero,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (!isUser)
                        AnimatedTextKit(
                          animatedTexts: [
                            TyperAnimatedText(
                              message,
                              textStyle: messageText,
                              textAlign: TextAlign.left,
                            ),
                          ],
                          totalRepeatCount: 1,
                          isRepeatingAnimation: false,
                          stopPauseOnTap: true,
                          onFinished: () {
                            isAnimated.value = true;
                            onAnimatedTextFinished();
                          },
                        ),
                      if (isUser)
                        Text(
                          message,
                          style: messageText,
                          textAlign: TextAlign.left,
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          if (!isUser)
            Padding(
              padding: const EdgeInsets.only(left: xsmall, top: 4),
              child: MessageActions(
                onLike: () {},
                onDislike: () {},
                onShare: () {},
                onCopy: () {
                  Clipboard.setData(ClipboardData(text: message));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Message copied to clipboard')),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}