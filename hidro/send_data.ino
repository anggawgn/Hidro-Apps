void send_data_sensor() {
  //Convert float value to char
  temp_str = String(get_temperature_value());
  temp_str.toCharArray(temperature, temp_str.length() + 1);

  hum_str = String(get_humidity_value());
  hum_str.toCharArray(humidity, hum_str.length() + 1);

  light_str = String(get_light_value());
  light_str.toCharArray(light, light_str.length() + 1);

  water_str = String(get_water_value());
  water_str.toCharArray(water, water_str.length() + 1);

  ph_str = String(get_ph_value());
  ph_str.toCharArray(ph, ph_str.length() + 1);

  ppm_str = String(get_ppm_value());
  ppm_str.toCharArray(ppm, ppm_str.length() + 1);

  //Publish sensor data to MQTT Server
  client.publish("anggawgn/temperature", temperature);
  client.publish("anggawgn/humidity", humidity);
  client.publish("anggawgn/light", light);
  client.publish("anggawgn/water", water);
  client.publish("anggawgn/ph", ph);
  client.publish("anggawgn/ppm", ppm);
}
