// lib/widgets/message_actions.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'feedback_bottom_sheet.dart';
import 'suggestions_bottom_sheet.dart';

class MessageActions extends StatefulWidget {
  final String message;

  const MessageActions({
    Key? key,
    required this.message,
  }) : super(key: key);

  @override
  State<MessageActions> createState() => _MessageActionsState();
}

class _MessageActionsState extends State<MessageActions> {
  bool isLiked = false;
  bool isDisliked = false;

  void _handleLike() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FeedbackBottomSheet(
        isPositive: true,
        onSubmit: (feedback) {
          setState(() {
            isLiked = true;
            isDisliked = false;
          });
        },
      ),
    );
  }

  void _handleDislike() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FeedbackBottomSheet(
        isPositive: false,
        onSubmit: (feedback) {
          setState(() {
            isDisliked = true;
            isLiked = false;
          });
        },
      ),
    );
  }

  void _showSuggestions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => const SuggestionsBottomSheet(),
    );
  }

  void _handleShare() {
    Share.share(widget.message);
  }

  void _handleMore() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[900],
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.content_copy, color: Colors.white),
              title: Text('Select text', style: TextStyle(color: Colors.grey[200])),
              onTap: () {
                Navigator.pop(context);
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: Colors.grey[900],
                    content: SelectableText(
                      widget.message,
                      style: TextStyle(color: Colors.grey[200]),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Close'),
                      ),
                    ],
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.flag, color: Colors.white),
              title: Text('Report', style: TextStyle(color: Colors.grey[200])),
              onTap: () {
                Navigator.pop(context);
                // Handle report functionality
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.thumb_up_outlined),
          onPressed: _handleLike,
          iconSize: 20,
          color: isLiked ? const Color(0xFFFFF3EF) : Colors.grey[700],
        ),
        IconButton(
          icon: const Icon(Icons.thumb_down_outlined),
          onPressed: _handleDislike,
          iconSize: 20,
          color: isDisliked ? const Color(0xFFFFF3EF) : Colors.grey[700],
        ),
        IconButton(
          icon: Image.asset(
            'assets/monova.png',
            width: 20,
            height: 20,
          ),
          onPressed: _showSuggestions,
          iconSize: 20,
        ),
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: _handleShare,
          iconSize: 20,
          color: Colors.grey[700],
        ),
        IconButton(
          icon: const Icon(Icons.copy),
          onPressed: () {
            Clipboard.setData(ClipboardData(text: widget.message));
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Message copied to clipboard')),
            );
          },
          iconSize: 20,
          color: Colors.grey[700],
        ),
        IconButton(
          icon: const Icon(Icons.more_vert),
          onPressed: _handleMore,
          iconSize: 20,
          color: Colors.grey[700],
        ),
      ],
    );
  }
}