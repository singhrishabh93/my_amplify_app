// lib/widgets/message_actions.dart
import 'package:flutter/material.dart';

class MessageActions extends StatelessWidget {
  final VoidCallback onLike;
  final VoidCallback onDislike;
  final VoidCallback onShare;
  final VoidCallback onCopy;

  const MessageActions({
    Key? key,
    required this.onLike,
    required this.onDislike,
    required this.onShare,
    required this.onCopy,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.thumb_up_outlined),
          onPressed: onLike,
          iconSize: 20,
          color: Colors.grey[700],
        ),
        IconButton(
          icon: const Icon(Icons.thumb_down_outlined),
          onPressed: onDislike,
          iconSize: 20,
          color: Colors.grey[700],
        ),
        IconButton(
          icon: Image.asset(
            'assets/monova.png',
            width: 20,
            height: 20,
          ),
          onPressed: () {},
          iconSize: 20,
        ),
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: onShare,
          iconSize: 20,
          color: Colors.grey[700],
        ),
        IconButton(
          icon: const Icon(Icons.copy),
          onPressed: onCopy,
          iconSize: 20,
          color: Colors.grey[700],
        ),
      ],
    );
  }
}