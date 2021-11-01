void turnPump(String message) {
  if (message == "on") {
    digitalWrite(pump, LOW);
  } else if (message == "off") {
    digitalWrite(pump, HIGH);
  }
}
