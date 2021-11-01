float get_ppm_value() {
  gravityTds.setTemperature(global_water_value);
  gravityTds.update();

  TDSValue = gravityTds.getTdsValue();
  float tdsValue = TDSValue;
  global_ppm_value = tdsValue;

  return tdsValue;
}
