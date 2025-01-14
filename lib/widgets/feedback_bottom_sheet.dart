// lib/widgets/feedback_bottom_sheet.dart
import 'package:flutter/material.dart';
import '../models/feedback_option.dart';

class FeedbackBottomSheet extends StatefulWidget {
  final bool isPositive;
  final Function(String) onSubmit;

  const FeedbackBottomSheet({
    Key? key,
    required this.isPositive,
    required this.onSubmit,
  }) : super(key: key);

  @override
  State<FeedbackBottomSheet> createState() => _FeedbackBottomSheetState();
}

class _FeedbackBottomSheetState extends State<FeedbackBottomSheet> {
  final TextEditingController _feedbackController = TextEditingController();
  final List<FeedbackOption> positiveOptions = [
    FeedbackOption(title: 'Correct'),
    FeedbackOption(title: 'Easy to understand'),
    FeedbackOption(title: 'Complete'),
  ];

  final List<FeedbackOption> negativeOptions = [
    FeedbackOption(title: 'Offensive/unsafe'),
    FeedbackOption(title: 'Not factually correct'),
    FeedbackOption(title: 'Other'),
  ];

  @override
  Widget build(BuildContext context) {
    final options = widget.isPositive ? positiveOptions : negativeOptions;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Why did you choose this rating? (optional)',
                style: TextStyle(
                  color: Colors.grey[200],
                  fontSize: 16,
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
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: options.map((option) {
              return FilterChip(
                label: Text(option.title),
                selected: option.isSelected,
                onSelected: (bool selected) {
                  setState(() {
                    option.isSelected = selected;
                  });
                },
                backgroundColor: Colors.grey[800],
                selectedColor: Colors.blue,
                checkmarkColor: Colors.white,
                labelStyle: TextStyle(color: Colors.grey[200]),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _feedbackController,
            style: TextStyle(color: Colors.grey[200]),
            decoration: InputDecoration(
              hintText: 'Provide additional feedback',
              hintStyle: TextStyle(color: Colors.grey[500]),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[700]!),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[700]!),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.blue),
              ),
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () {
                widget.onSubmit(_feedbackController.text);
                Navigator.pop(context);
              },
              child: Text(
                'Submit',
                style: TextStyle(color: Colors.grey[200]),
              ),
            ),
          ),
        ],
      ),
    );
  }
}