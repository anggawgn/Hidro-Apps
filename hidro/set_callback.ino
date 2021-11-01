void callback(char* topic, byte* message, unsigned int length) {
  String serverMessage;

  for (int i = 0; i < length; i++) {
    serverMessage += (char)message[i];
  }

  if (strcmp(topic,"anggawgn/pump-mode")==0) {
    if (String(serverMessage) == "auto") {
      pump_auto_state = "auto";
    } else if (String(serverMessage) == "manual") {
      pump_auto_state = "manual";
    }
  }

  if (strcmp(topic,"anggawgn/growlight-mode")==0) {
    if (String(serverMessage) == "auto") {
      growlight_auto_state = "auto";
    } else if (String(serverMessage) == "manual") {
      growlight_auto_state = "manual";
    }
  }

  if (strcmp(topic,"anggawgn/pump")==0) {
    turnPump(serverMessage);
  }

  if (strcmp(topic,"anggawgn/growlight")==0) {
    turnGrowlight(serverMessage);
  }

  //Process Nilai Sensor pH
  if (strcmp(topic, "anggawgn/max-ph")==0) {
    maxPH = serverMessage.toInt();
    EEPROM.write(addr_maxPH, maxPH);
    EEPROM.commit();
  } else if (strcmp(topic, "anggawgn/min-ph")==0) {
    minPH = serverMessage.toInt();
    EEPROM.write(addr_minPH, minPH);
    EEPROM.commit();
  }
  EEPROM.commit();

  //Process Nilai Sensor Lux
  if (strcmp(topic, "anggawgn/max-light")==0) {
    maxLux = serverMessage.toInt();
    EEPROM.write(addr_maxLux, maxLux);
    EEPROM.commit();
  } else if (strcmp(topic, "anggawgn/min-light")==0) {
    minLux = serverMessage.toInt();
    EEPROM.write(addr_minLux, minLux);
    EEPROM.commit();
  }
  EEPROM.commit();

  //Proses Penjadwalan Pump
  if (strcmp(topic,"anggawgn/jam-pagi-pump")==0) {
    //jam_pagi_pump = 0;
    jam_pagi_pump = serverMessage.toInt();
    EEPROM.write(addr_jam_pagi_pump, jam_pagi_pump);
    EEPROM.commit();
  } else if (strcmp(topic,"anggawgn/menit-pagi-pump")==0) {
    //menit_pagi_pump = 0;
    menit_pagi_pump = serverMessage.toInt();
    EEPROM.write(addr_menit_pagi_pump, menit_pagi_pump);
    EEPROM.commit();
  } else if (strcmp(topic,"anggawgn/jam-sore-pump")==0) {
    //jam_sore_pump = 0;
    jam_sore_pump = serverMessage.toInt();
    EEPROM.write(addr_jam_sore_pump, jam_sore_pump);
    EEPROM.commit();
  } else if (strcmp(topic,"anggawgn/menit-sore-pump")==0) {
    //menit_sore_pump = 0;
    menit_sore_pump = serverMessage.toInt();
    EEPROM.write(addr_menit_sore_pump, menit_sore_pump);
    EEPROM.commit();
  }
  EEPROM.commit();

  //Proses Penjadwalan Growlight
  if (strcmp(topic,"anggawgn/jam-pagi-growlight")==0) {
    jam_pagi_growlight = 0;
    jam_pagi_growlight = serverMessage.toInt();
    EEPROM.write(addr_jam_pagi_growlight, jam_pagi_growlight);
    EEPROM.commit();
  } else if (strcmp(topic,"anggawgn/menit-pagi-growlight")==0) {
    menit_pagi_growlight = 0;
    menit_pagi_growlight = serverMessage.toInt();
    EEPROM.write(addr_menit_pagi_growlight, menit_pagi_growlight);
    EEPROM.commit();
  } else if (strcmp(topic,"anggawgn/jam-sore-growlight")==0) {
    jam_sore_growlight = 0;
    jam_sore_growlight = serverMessage.toInt();
    EEPROM.write(addr_jam_sore_growlight, jam_sore_growlight);
    EEPROM.commit();
  } else if (strcmp(topic,"anggawgn/menit-sore-growlight")==0) {
    menit_sore_growlight = 0;
    menit_sore_growlight = serverMessage.toInt();
    EEPROM.write(addr_menit_sore_growlight, menit_sore_growlight);
    EEPROM.commit();
  }
  EEPROM.commit();

  if (strcmp(topic,"anggawgn/times")==0) {
    server_time = serverMessage.toInt();
  }
  
}
