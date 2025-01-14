// lib/widgets/suggestions_bottom_sheet.dart
import 'package:flutter/material.dart';

class SuggestionsBottomSheet extends StatelessWidget {
  const SuggestionsBottomSheet({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Search related topics',
                style: TextStyle(
                  color: Colors.grey[200],
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ListTile(
            leading: const Icon(Icons.search, color: Colors.blue),
            title: Text(
              'What does hello mean?',
              style: TextStyle(color: Colors.grey[200]),
            ),
            onTap: () {
              // Handle suggestion tap
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: const Icon(Icons.search, color: Colors.blue),
            title: Text(
              'Who said hello?',
              style: TextStyle(color: Colors.grey[200]),
            ),
            onTap: () {
              // Handle suggestion tap
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
}