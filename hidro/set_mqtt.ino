void reconnect() {
  while (!client.connected()) {
    Serial.println("Connecting to MQTT . . .");
    if (client.connect("ESPClient", mqtt_user, mqtt_pass)) {
      Serial.println("Connected to MQTT!");

      //Subscribe to the Specified MQTT Topic
      client.subscribe("anggawgn/pump-mode");
      client.subscribe("anggawgn/pump");
      client.subscribe("anggawgn/growlight-mode");
      client.subscribe("anggawgn/growlight");
      client.subscribe("anggawgn/jam-pagi-pump");
      client.subscribe("anggawgn/menit-pagi-pump");
      client.subscribe("anggawgn/jam-sore-pump");
      client.subscribe("anggawgn/menit-sore-pump");
      client.subscribe("anggawgn/jam-pagi-growlight");
      client.subscribe("anggawgn/menit-pagi-growlight");
      client.subscribe("anggawgn/jam-sore-growlight");
      client.subscribe("anggawgn/menit-sore-growlight");
      client.subscribe("anggawgn/max-ph");
      client.subscribe("anggawgn/min-ph");
      client.subscribe("anggawgn/max-light");
      client.subscribe("anggawgn/min-light");
      client.subscribe("anggawgn/times");
    } else {
      Serial.println("Failed connect to MQTT Broker");
      Serial.println(client.state());
      Serial.println("Try Again in 5 seconds");
      delay(5000);
    }
  }
}
