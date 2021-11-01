#include <WiFi.h>
#include <PubSubClient.h>
#include <EEPROM.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <BH1750.h>
#include "DHT.h"
#include "GravityTDS.h"
#include "RTClib.h"

//---------------------- Declaration To Connect With WiFi ----------------------//
const char* ssid = "GriyaAnyar";
const char* pass = "lenovok80";

//---------------------- Declaration To Connect With MQTT Broker ----------------------//
const char* mqtt_server = "mqtt.kos-dwipa.com";
const int mqtt_port = 1883;
const char* mqtt_user = "anggawgn";
const char* mqtt_pass = "@Kucing123";

//---------------------- Declaration For Data Transmission ----------------------//
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
char msg[50];
int value = 0;

//---------------------- Declaration For Actuator Pin ----------------------//
#define pump 18
#define growlight 19

//---------------------- Declaration For RTC DS3231 ----------------------//
RTC_DS3231 rtc;

char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

//---------------------- Declaration For DHT22 Sensor ----------------------//
#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

//---------------------- Declaration For BH1750 Sensor ----------------------//
BH1750 lightMeter;

//---------------------- Declaration For DS18B20 Sensor ----------------------//
const int oneWireBus = 2;

OneWire oneWire(oneWireBus);
DallasTemperature waterSensor(&oneWire);

//---------------------- Declaration For pH Meter Sensor ----------------------//
#define PHPin 35
#define Offset 2.20
#define ArrayLength 40

//---------------------- Declaration For TDS Meter Sensor ----------------------//
#define TDSPin 34
GravityTDS gravityTds;

float TDSValue = 0;

//-------------------------------- Deklarasi Value EEPROM -------------------------------//
int maxPH;
int minPH;
int maxLux;
int minLux;
int jam_pagi_pump;
int menit_pagi_pump;
int jam_sore_pump;
int menit_sore_pump;
int jam_pagi_growlight;
int menit_pagi_growlight;
int jam_sore_growlight;
int menit_sore_growlight;
int detik_genap = 0;
int detik_ganjil = 1;

//-------------------------------- Deklarasi Alamat EEPROM -------------------------------//
int addr_maxPH = 0;
int addr_minPH = 1;
int addr_maxLux = 3;
int addr_minLux = 4;
int addr_jam_pagi_pump = 5;
int addr_menit_pagi_pump = 6;
int addr_jam_sore_pump = 7;
int addr_menit_sore_pump = 8;
int addr_jam_pagi_growlight = 9;
int addr_menit_pagi_growlight = 10;
int addr_jam_sore_growlight = 11;
int addr_menit_sore_growlight = 12;

//---------------------- Declaration For Array Value and String Value to MQTT Broker ----------------------//
String temp_str;
char temperature[200];
String hum_str;
char humidity[200];
String light_str;
char light[200];
String water_str;
char water[100];
String ph_str;
char ph[100];
String ppm_str;
char ppm[100];

//---------------------- Declaration For Global Variable Sensor Value ----------------------//
float global_temp_value;
float global_hum_value;
float global_light_value;
float global_water_value;
float global_ph_value;
float global_ppm_value;

//---------------------- Declaration For Global Variable Status Actuator ----------------------//
String pump_auto_state = "auto";
String growlight_auto_state = "auto";

int server_time;

void setup() {
  #ifndef ESP32
    while (!Serial); // for Leonardo/Micro/Zero
  #endif

  Serial.begin(115200);

  //Start Connection WiFi and MQTT
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  //Initialize I2C
  Wire.begin(21, 22);

  //Start RTC DS3231
  if (! rtc.begin()) {
    Serial.println("Couldn't find RTC");
    while (1);
  }

  if (rtc.lostPower()) {
    Serial.println("RTC lost power, lets set the time!");
    //rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // This line sets the RTC with an explicit date & time, for example to set
    // January 21, 2014 at 3am you would call:
    rtc.adjust(DateTime(2021, 8, 14, 14, 51, 0));
  }

  //Start EEPROM
  EEPROM.begin(512);

  maxPH = EEPROM.read(addr_maxPH);
  minPH = EEPROM.read(addr_minPH);
  maxLux = EEPROM.read(addr_maxLux);
  minLux = EEPROM.read(addr_minLux);
  jam_pagi_pump = EEPROM.read(addr_jam_pagi_pump);
  menit_pagi_pump = EEPROM.read(addr_menit_pagi_pump);
  jam_sore_pump = EEPROM.read(addr_jam_sore_pump);
  menit_sore_pump = EEPROM.read(addr_menit_sore_pump);
  jam_pagi_growlight = EEPROM.read(addr_jam_pagi_growlight);
  menit_pagi_growlight = EEPROM.read(addr_menit_pagi_growlight);
  jam_sore_growlight = EEPROM.read(addr_jam_sore_growlight);
  menit_sore_growlight = EEPROM.read(addr_menit_sore_growlight);

  //Start actuator pinMode
  pinMode(pump, OUTPUT);
  pinMode(growlight, OUTPUT);

  //Turn OFF the pump and growlight when the system started
  digitalWrite(pump, HIGH);
  digitalWrite(growlight, HIGH);

  //Start DHT22 Sensor
  dht.begin();

  //Start BH1750 Sensor
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire);

  //Start DS18B20 Sensor
  waterSensor.begin();

  //Start pH Meter Sensor
  //pHSensor.begin();

  //Start TDS Sensor
  gravityTds.setPin(TDSPin);
  gravityTds.setAref(3.3);
  gravityTds.setAdcRange(4096);

}

void loop() {
  DateTime now = rtc.now();
  
  //Function reconnect MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop(); //loop connection

  //send data sensor to server every one second
  unsigned long times = millis();
  if (times - lastMsg > 1000) {
    send_data_sensor();

    if (pump_auto_state == "auto") {
      if (jam_pagi_pump == now.hour()) {
        if (menit_pagi_pump == now.minute()) {
          digitalWrite(pump, LOW);
        }
      }
      
    if (jam_sore_pump == now.hour()) {
      if (menit_sore_pump == now.minute()) {
        digitalWrite(pump, HIGH);
      }
    }

      if (server_time > 6 && server_time < 18) {
        if (global_ph_value <= minPH) {
          digitalWrite(pump, HIGH);
        } else if (global_ph_value >= maxPH) {
          digitalWrite(pump, HIGH);
        } else if (global_ph_value > minPH || global_ph_value < maxPH) {
          digitalWrite(pump, LOW);
        } 
      }
    }

    if (growlight_auto_state == "auto") {
      if (now.hour() == jam_pagi_growlight) {
        if (now.minute() == menit_pagi_growlight) {
          digitalWrite(growlight, HIGH); 
        }
      }
      
      if (now.hour() == jam_sore_growlight) {
        if (now.minute() == menit_sore_growlight) {
          digitalWrite(growlight, LOW);
        }
      }

      if (server_time >= 6 && server_time <= 18) {
        if (global_light_value <= minLux) {
          digitalWrite(growlight, LOW);
        } else if (global_light_value >= maxLux) {
          digitalWrite(growlight, HIGH);
        } 
      }
    }

    Serial.print("Jam_pagi_pump :");
    Serial.println(jam_pagi_pump);
    Serial.print("Menit_pagi_pump :");
    Serial.println(menit_pagi_pump);
    Serial.print("Jam_sore_pump :");
    Serial.println(jam_sore_pump);
    Serial.print("Menit_sore_pump :");
    Serial.println(menit_sore_pump);

    Serial.print("Jam_pagi_pump :");
    Serial.println(jam_pagi_growlight);
    Serial.print("Menit_pagi_pump :");
    Serial.println(menit_pagi_growlight);
    Serial.print("Jam_sore_pump :");
    Serial.println(jam_sore_growlight);
    Serial.print("Menit_sore_pump :");
    Serial.println(menit_sore_growlight);

    Serial.print("Min PH :");
    Serial.println(minPH);
    Serial.print("Max PH :");
    Serial.println(maxPH);
    Serial.print("Mix Lux :");
    Serial.println(minLux);
    Serial.print("Max Lux :");
    Serial.println(maxLux);

    Serial.println();
    Serial.print(now.hour(), DEC);
    Serial.print(':');
    Serial.print(now.minute(), DEC);
    Serial.print(':');
    Serial.print(now.second(), DEC);
    Serial.println();

    Serial.println(server_time);

    lastMsg = times;
  }

}
