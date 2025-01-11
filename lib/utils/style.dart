import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../utils/size.dart';

Color background = const Color(0xFFFFFFFF);
Color userChat = const Color(0xFFFFF3EF);
Color resChat = const Color(0xFFF3F3F3);
Color chatColor = const Color(0xFF47698A);
var white = const Color(0xFF1F1F1F);
Color hintColor = const Color(0xFF47698A);

TextStyle messageText = const TextStyle(
  fontFamily: 'SatoshiR', 
  color: Color(0xFF1F1F1F),
  fontSize: 17.0,
  fontWeight: FontWeight.w500,
);
// TextStyle appBarTitle = GoogleFonts.poppins(color: white, fontWeight: FontWeight.bold);
TextStyle hintText = GoogleFonts.poppins(color: hintColor, fontSize: small);
TextStyle dateText = GoogleFonts.poppins(color: white, fontSize: 13);
TextStyle promptText = GoogleFonts.poppins(color: white, fontSize: small);