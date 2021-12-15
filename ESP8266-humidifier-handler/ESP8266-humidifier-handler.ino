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

  /*  Establishes WiFi connection.*/
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  server.begin();
}

void loop(){
  WiFiClient client = server.available();
  
  /*  If client connects.*/
  if(client){
    String currentLine = ""; 
    currTime = millis();
    prevTime = currTime;
    
    /*  While client is connected and timeout is not reached.*/
    while(client.connected() && currTime - prevTime <= timeoutTime){
      currTime = millis();
      if(client.available()){
        
        /*  Reads the clients request.*/
        char c = client.read();
        Serial.write(c);
        header += c;
        if(c == '\n'){
          if(currentLine.length() == 0){
            
            /*  Responds with a json document.*/
            client.println("HTTP/1.1 200 OK");
            client.println("access-control-allow-origin:*");
            client.println("Content-type:application/json");
            client.println("Connection: close");
            client.println();
            
            /*  Checks the clients request.
                Depending on what it is it can, 
                for example, power off/on the humidifier
                or change the timer on the humidifier
                
                After that it updates the state. 
            */
            if(header.indexOf("GET /IR/power") >= 0){
                irsend.sendNEC(POWER, 32);
                if(state.power == 0 || state.power == -1){
                  state.power = 1;
                }
                else{
                  state.power = 0;
                }
            }
            else if(header.indexOf("GET /IR/level") >= 0){
                irsend.sendNEC(LEVEL, 32);
                if(state.level == 0 || state.level == -1){
                  state.level = 1;
                }
                else if(state.level == 1){
                  state.level = 2;
                }
                else{
                  state.level = 0;
                }

            }
            else if(header.indexOf("GET /IR/hum") >= 0){
                irsend.sendNEC(HUMIDIFY, 32);
                if(state.hum == 0 || state.hum == -1){
                  state.hum = 1;
                }
                else{
                  state.hum = 0;
                }
            }
            else if(header.indexOf("GET /IR/mode") >= 0){
                irsend.sendNEC(MODE, 32);
                if(state.mde == 0 || state.mde == -1){
                  state.mde = 1;
                }
                else if (state.mde == 1){
                  state.mde = 2;
                }
                else{
                  state.mde = 0;
                }
            }
            else if(header.indexOf("GET /IR/swing") >= 0){
                irsend.sendNEC(SWING, 32);
                if(state.swing == 0 || state.swing == -1){
                  state.swing = 1;
                }
                else{
                  state.swing = 0;
                }
            }
            else if(header.indexOf("GET /IR/timer") >= 0){
                irsend.sendNEC(TIMER, 32);
                if(state.timer == 0 || state.timer == -1){
                  state.timer = 1;
                }
                else if(state.timer == 1){
                  state.timer = 2;
                }
                else{
                  state.timer = 0;
                }
            }
            else if(header.indexOf("GET /IR/ionizer") >= 0){
                irsend.sendNEC(IONIZER, 32);
                
                if(state.ionizer == 0 || state.ionizer == -1){
                  state.ionizer = 1;
                }
                else{
                  state.ionizer = 0;
                }
            }
            else if(header.indexOf("GET /IR/RESET") >= 0){
              state.power = 0;
              state.level = 0;
              state.hum = 0;
              state.mde = 0;
              state.swing = 0;
              state.timer = 0;
              state.ionizer = 0;
            }
            else if(header.indexOf("GET /state") >= 0){
              /*  Prints out the state as a json document.*/
              client.print("{ \"power\": ");
              client.print(state.power);
              client.print(", \"level\": ");
              client.print(state.level); 
              client.print(", \"humiditiy\": ");
              client.print(state.hum);
              client.print(", \"mode\": ");
              client.print(state.mde);
              client.print(", \"swing\": ");
              client.print(state.swing);
              client.print(", \"timer\": ");
              client.print(state.timer);
              client.print(", \"ionizer\": ");
              client.print(state.ionizer);
              client.print("}");
            }
            //updateEeprom();
            break;
          } 
          else {
            currentLine = "";
        }
      }
      else if (c != '\r') {
        currentLine += c; 
      }
    }
  }
  header = "";

  client.stop();
  Serial.println("Client disconnected.");
  Serial.println("");
  }
}
