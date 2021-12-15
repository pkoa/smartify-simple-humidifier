/*
  Author: Erik af Geijerstam

  Code built from https://github.com/mobizt/Firebase-ESP-Client/blob/main/examples/Firestore/CreateDocuments/CreateDocuments.ino
*/

/*
  Adding includes, for usage with esp8266 use <ESP8266WiFi.h> instead.
  
  passwords.h should contain WIFI_SSID and WIFI_PASSWORD,
  as well as firebase retlated keys: API_KEY, FIREBASE_PROJECT_ID,
  USER_EMAIL and USER_PASSWORD.
*/
#include <WiFi.h>
#include <EEPROM.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include "DHT.h"
#include "passwords.h"

/*
  Defining DHT related variables
  Change DHTTYPE and DHTPIN as needed
*/
#define DHTTYPE DHT11
#define DHTPIN 2
DHT dht(DHTPIN, DHTTYPE);
double dhtTemp = 0.0;
int dhtHum = 0;

/*
  Defining firebase related variables

  for an explanation on usage 
  https://github.com/mobizt/Firebase-ESP-Client/blob/main/src/README.md
*/
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/*
  Internal esp32 eeprom usage, used for saving id.
*/
int eepromAddr1 = 0;
int count = 0;

unsigned long currentMillis = 0;

void setup(){
  /*  Starting serial, used mostly for debugging. 
      Delay is called to make sure serial is initialized.*/
  Serial.begin(115200);
  delay(100);
  
  dht.begin();
  /*  Starting EEPROM, used for saving id between sessions.*/
  EEPROM.begin(512);
  Serial.println("Starting EEPROM");
  delay(500);
  Serial.println("Getting count from EEPROM");
  int rInt = EEPROM.readInt(eepromAddr1);
  Serial.println("Read from EEPROM");
  Serial.print("Int:");
  Serial.println(rInt);
  count = rInt;
  
  /*  Starting Wifi.*/
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
      Serial.print(".");
      delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  /*  Some information about the client, useful when debugging*/
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  
  /* Assigning the api key, user information and callbackfunction */
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop(){
  if(Firebase.ready() && (millis() - currentMillis > 20000 || currentMillis == 0)){
    currentMillis = millis();
    
    /*  Reading DHT sensor.*/
    dhtTemp = dht.readTemperature();
    dhtHum = dht.readHumidity();
    if(isnan(dhtTemp)||isnan(dhtHum)){
      Serial.println("DHT read failed");
      return;
    }
    
    /* Creating document to send */
    FirebaseJson content;

    /*  Path to document, collection: "esp1_dht" id: "(int)count".*/
    String documentPath = "esp1_dht/" + String(count);

    content.set("fields/humidity/integerValue", dhtHum);
    content.set("fields/temperature/doubleValue", dhtTemp);
    content.set("fields/id/integerValue", count);

    Serial.print("Create a document... ");
    
    /*  Creating document in database.*/
    if(Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), content.raw())){
        Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
        count++;
        EEPROM.writeInt(eepromAddr1, count);
        EEPROM.commit();
        Serial.println("Write to EEPROM successful");
        
    }
    else
        Serial.println(fbdo.errorReason());
  }
}
