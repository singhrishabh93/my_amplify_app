// lib/widgets/chat_input.dart
import 'package:flutter/material.dart';
import '../utils/size.dart';

class ChatInput extends StatelessWidget {
  final TextEditingController controller;
  final bool isLoading;
  final VoidCallback onSend;

  const ChatInput({
    Key? key,
    required this.controller,
    required this.isLoading,
    required this.onSend,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Divider(height: 1, thickness: 1, color: Color(0xFFEEEEEE)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: medium, vertical: small),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(15),
            ),
            child: TextFormField(
              maxLines: 1,
              minLines: 1,
              controller: controller,
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
                  icon: const Icon(Icons.send_rounded, size: 24),
                  color: controller.text.isNotEmpty
                      ? const Color(0xFF1f1f1f)
                      : const Color(0xFF9B9B9B),
                  onPressed: controller.text.isEmpty || isLoading ? null : onSend,
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
    );
  }
}