float get_ph_value() {
  float volt = analogRead(PHPin)*3.3/4096;
  float ph_value = 3.5*volt+Offset;
//  float rdm = random(0, 40);
//  float ph_value = 7 + (rdm/100);
  global_ph_value = ph_value;

  return ph_value;
}
