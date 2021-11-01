float get_temperature_value() {
  float temp = dht.readTemperature();
  global_temp_value = temp;

  return temp;
}

float get_humidity_value() {
  float h = dht.readHumidity();
  float hum = h - 27;
  global_hum_value = hum;

  return hum;
}
