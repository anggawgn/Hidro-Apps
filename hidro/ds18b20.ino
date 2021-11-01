float get_water_value() {
  waterSensor.requestTemperatures();

  float water_temperature = waterSensor.getTempCByIndex(0);
//float rdm = random(0, 40);
//float ph_value = 25 + (rdm/100);
  global_water_value = water_temperature;

  return water_temperature;
}
