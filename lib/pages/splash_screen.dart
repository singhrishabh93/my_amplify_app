import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:my_amplify_app/pages/chat_screen.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(statusBarColor: Color(0xFFE05D38)),
    );

    
    Future.delayed(const Duration(seconds: 3), () {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => ChatScreen()), 
      );
    });

    return Scaffold(
      backgroundColor: const Color(0xFFE05D38), 
      body: Center(
        child: Image.asset('assets/logo.png'), 
      ),
    );
  }
}
