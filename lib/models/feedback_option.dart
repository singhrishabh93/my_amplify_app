// lib/models/feedback_option.dart
class FeedbackOption {
  final String title;
  bool isSelected;  // Removed final to allow modification

  FeedbackOption({
    required this.title, 
    this.isSelected = false
  });
}