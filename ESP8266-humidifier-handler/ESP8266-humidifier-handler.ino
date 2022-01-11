/*
  Author: Erik af Geijerstam

  Control of humidifier COOL116CWT via webserver and IR led.
*/

/*
  Adding includes
  
  passwords.h should contain WIFI_SSID and WIFI_PASSWORD
*/
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <EEPROM.h>
#include <IRremoteESP8266.h>
#include <IRutils.h>
#include <IRsend.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include "passwords.h"

/*
  Defining IR hex codes used by the humidifier.
*/
#define POWER 0xFF629D
#define LEVEL 0xFF22DD
#define HUMIDIFY 0xFFC23D
#define MODE 0xFF6897
#define SWING 0xFFB04F
#define TIMER 0xFF10EF
#define IONIZER 0xFF5AA5
#define HOLD 0x4CB0FADD

/*
  Setting up required variables for the webserver.
  The state struct holds the information about the humidifiers state.
  The state gets saved into EEPROM to preserve state between sessions
  IR is used to communicate between esp and humidifier.
*/
WiFiServer server(80);
String header;

struct State{
  int power;
  int level;
  int hum;
  int mde;
  int swing;
  int timer;
  int ionizer;
}state;

int eepromAddr1 = 0;
const uint16_t sendPin = 4;
IRsend irsend(sendPin);

unsigned long currTime = millis();
unsigned long prevTime = 0;
const long timeoutTime = 2000;

/*
  Use to update state in eeprom
*/
void updateEeprom(){
  EEPROM.put(eepromAddr1, state);
  EEPROM.commit();
}



/*
  Firebase objects
*/
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

bool taskCompleted = false;
int updatedState = 0;

unsigned long dataMillis = 0;
/*
  Used to update the state
*/
void updateState(String wantedState){
  FirebaseJson contentJson;
  FirebaseJsonData result;
  contentJson.setJsonData(wantedState);
  
  contentJson.get(result, "fields/power/integerValue");
  Serial.println("DECERIALIZED");
  Serial.println(result.type);
  Serial.println(result.to<String>());
  Serial.println(result.to<String>().toInt());
  Serial.println(state.power);
  
  if(result.to<String>() == "1" && state.power == 0){
    irsend.sendNEC(POWER, 32);
    delay(50);
    state.power = 1;
    //Serial.println("THIS IS IT MORTY!!!!!!!!!!!!!!!!!!!!");
    updatedState = 1;
  }
  else if(result.to<String>() == "0" && state.power == 1){
    if(state.hum == 1){
      irsend.sendNEC(POWER, 32);
      delay(50);
      irsend.sendNEC(POWER, 32);
      delay(50);
    }
    irsend.sendNEC(POWER, 32);
    
    state.power = 0;
    state.hum = 0;
    state.level = 0;
    state.mde = 0;
    state.swing = 0;
    state.timer = 0;
    state.ionizer = 0;

    updatedState = 1;
  }
  
  if(state.power == 1){
    contentJson.get(result, "fields/level/integerValue");
    
    if(result.to<String>() == "0"){
      if(state.level == 0){
        //level 0 times
      }
      if(state.level == 1){
        //level 2 times
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        state.level = 0;
        updatedState = 1;
      }
      if(state.level == 2){
        //level 1 times
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        state.level = 0;
        updatedState = 1;
      }
    }
    else if(result.to<String>() == "1"){
      if(state.level == 0){
        //level 1 times
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        state.level = 1;
        updatedState = 1;
      }
      if(state.level == 1){
        //level 0 times
      }
      if(state.level == 2){
        // level 2 times
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        state.level = 1;
        updatedState = 1;
      }
    }
    else if(result.to<String>() == "2"){
      if(state.level == 0){
        //level 2 times
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        state.level = 2;
        updatedState = 1;
      }
      if(state.level == 1){
        //level 1 times
        irsend.sendNEC(LEVEL, 32);
        delay(50);
        state.level = 2;
        updatedState = 1;
      }
      if(state.level == 2){
        //level 0 times
      }
    }

    contentJson.get(result, "fields/hum/integerValue");

    if(result.to<String>() == "1" && state.hum == 0){
      irsend.sendNEC(HUMIDIFY, 32);
      delay(50);
      state.hum = 1;
      updatedState = 1;
    }
    else if(result.to<String>() == "0" && state.hum == 1){
      irsend.sendNEC(HUMIDIFY, 32);
      delay(50);
      state.hum = 0;
      updatedState = 1;
    }
    
    contentJson.get(result, "fields/mode/integerValue");

    if(result.to<String>() == "0"){
      if(state.mde == 0){
        //mde 0 times
      }
      if(state.mde == 1){
        //mde 2 times
        irsend.sendNEC(MODE, 32);
        delay(50);
        irsend.sendNEC(MODE, 32);
        delay(50);
        state.mde = 0;
        updatedState = 1;
      }
      if(state.mde == 2){
        //mde 1 times
        irsend.sendNEC(MODE, 32);
        delay(50);
        state.mde = 0;
        updatedState = 1;
      }
    }
    else if(result.to<String>() == "1"){
      if(state.mde == 0){
        //mde 1 times
        irsend.sendNEC(MODE, 32);
        delay(50);
        state.mde = 1;
        updatedState = 1;
      }
      if(state.mde == 1){
        //mde 0 times
      }
      if(state.mde == 2){
        // mde 2 times
        irsend.sendNEC(MODE, 32);
        delay(50);
        irsend.sendNEC(MODE, 32);
        delay(50);
        state.mde = 1;
        updatedState = 1;
      }
    }
    else if(result.to<String>() == "2"){
      if(state.mde == 0){
        //mde 2 times
        irsend.sendNEC(MODE, 32);
        delay(50);
        irsend.sendNEC(MODE, 32);
        delay(50);
        state.mde = 2;
        updatedState = 1;
      }
      if(state.mde == 1){
        //mde 1 times
        irsend.sendNEC(MODE, 32);
        delay(50);
        state.mde = 2;
        updatedState = 1;
      }
      if(state.mde == 2){
        //mde 0 times
      }
    }
    
    contentJson.get(result, "fields/swing/integerValue");
    
    if(result.to<String>() == "1" && state.swing == 0){
      irsend.sendNEC(SWING, 32);
      delay(50);
      state.swing = 1;
      updatedState = 1;
    }
    else if(result.to<String>() == "0" && state.swing == 1){
      irsend.sendNEC(SWING, 32);
      delay(50);
      state.swing = 0;
      updatedState = 1;
    }

    /* timer tänk lite*/
    /* när timer startas gör timermillis = millis 
    o sen kolla i loop om den har kört nog, 
    updatera sen timer i både state och wantedstate */

    contentJson.get(result, "fields/ionizer/integerValue");

    if(result.to<String>() == "1" && state.ionizer == 0){
      irsend.sendNEC(IONIZER, 32);
      delay(50);
      state.ionizer = 1;
      updatedState = 1;
    }
    else if(result.to<String>() == "0" && state.ionizer == 1){
      irsend.sendNEC(IONIZER, 32);
      delay(50);
      state.ionizer = 0;
      updatedState = 1;
    }
   }
  
}
void setup(){
  /*  Establishes serial communication.*/
  Serial.begin(115200);
  
  /*  Establishes IR communication.*/
  irsend.begin();

  /*  Starts the EEPROM.*/
  EEPROM.begin(sizeof(state));
  Serial.println("Starting EEPROM");
  delay(500);
  EEPROM.get(eepromAddr1, state);
  if(state.power != 0 || state.power != 1){
    state.power = 0;
    state.hum = 0;
    state.level = 0;
    state.mde = 0;
    state.swing = 0;
    state.timer = 0;
    state.ionizer = 0;
  }

  /*  Establishes WiFi connection.*/
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  
  /* Assigning the api key, user information and callbackfunction */
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  server.begin();
  updatedState = 1;
}

void loop(){
  
  /*
    Update firebase
  */
  if(Firebase.ready() && updatedState == 1){
    
    /*
      Update firebase.state
    */
    FirebaseJson content;
    String documentPath = "esp-controller/state";

    content.set("fields/power/integerValue", state.power);
    content.set("fields/level/integerValue", state.level);
    content.set("fields/hum/integerValue", state.hum);
    content.set("fields/mode/integerValue", state.mde);
    content.set("fields/swing/integerValue", state.swing);
    content.set("fields/timer/integerValue", state.timer);
    content.set("fields/ionizer/integerValue", state.ionizer);

    Serial.print("Updating document");
    if (Firebase.Firestore.patchDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), content.raw(), "power,level,hum,mde,swing,timer,ionizer")){
      Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
    }
    else{
      Serial.println(fbdo.errorReason());
    }
    updatedState = 0;
  }
  
  /*
    Get wantedState
  */
  WiFiClient client = server.available();
  if(Firebase.ready() && (millis() - dataMillis > 10000 || dataMillis == 0 || client)){
    dataMillis = millis();
    
    if(client.available()){
      client.println("HTTP/1.1 200 OK");
      client.println("Access-Control-Allow-Origin: *");
      client.println("Content-type: image/jpeg");
      client.println("Connection: close");
      client.println();
      client.stop();
    }
    String documentPath = "esp-controller/wantedstate";
    String mask = "";

    if(Firebase.Firestore.getDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), mask.c_str())){
      Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
      
      /*
        Update State
      */
      updateState(fbdo.payload());
    }
    else{
      Serial.println(fbdo.errorReason());
    }
  }
}
