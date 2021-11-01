float get_light_value() {
  float lux = lightMeter.readLightLevel();
  global_light_value = lux;

  return lux;
}
