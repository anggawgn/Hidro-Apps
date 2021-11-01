void turnGrowlight(String message) {
  if (message == "on") {
    digitalWrite(growlight, LOW);
  } else if (message == "off") {
    digitalWrite(growlight, HIGH);
  }
}
