# simple-humidifier
*Gives smart control over your dumb humidifier💧*

## Overview
### Background
This project was born out of a want and need to automate the humidity in my room.</br>
I have eczema which gets really bad during the cold, dry months. To combat this I bought a fan/humidifier that would cool down the room during the summer and humidify the room during the winter. This worked well during the summer, mostly since I left the machine on day and night, however during the winter leaving it on dayround wasn't an option. I wanted more granular control over the humidifier, with the ability to schedule depending on humidity or temperature, but the remote that came with it was quite basic and the device itself was not smart.</br>
So instead going through the pain of either buying a new humidifier with the functionallity I wanted or getting used to checking the current humidity and using the basic remote to control the device every time, I created this project.
### How does it work?
![flowchart](images/simple-humidifier-flow.png)</br>

The collector sends the collected data to firebase, which acts as both database- and website- host.</br>
The website pulls data from the database and open weatherapis(openweatherapi and yr). These can be used to give an overview of how the humidity will rise or fall and can be taken into consideration when controlling the humidifier.</br>
The website can then be used to send instructions to the humidifier via the second microcontroller</br>
For the future of this project I want to add the ability to create and edit schedules for the humidifier based on the data collected. I also plan to add "smart" scheduling based on weather forecasts with the help of YRs forecast api. </br>
There could also come a point where I add machine learning to this project, but I think thats ways away and since there are open apis with forecasts out there I will stick to using these instead.</br></br>
The current website design looks like this: </br>![website](images/website.png)</br>
## Used components
This project makes use of two microcontrollers: 
* one ESP32 to collect temperature and humidity data with a DHT11 sensor.

I chose to use the ESP32 as the collector of data since its easy to work with and I am familiar with using it. </br>
The DHT11 sensor was used since I'am also quite familiar with it and for this home project I don't need anything more accurate than what it offers.</br>
* one ESP8266 to control the humidifier using an IR led.

The ESP8266 was used as the other because I had an extra lying around, if I had another ESP32 I would have used that instead.</br>
I chose to use an IR led and not to put the microcontroller directly in the machine because I didn't have enough information about the humidifier to ensure that if would be safe.</br></br>

I used firebase because:::

## Installation
### Prerequisits
Way of uploading code to the microcontrollers - I used Arduino IDE</br>
[guide to get started](https://dronebotworkshop.com/esp32-intro/)</br>
Installation of [firebase-esp](https://github.com/mobizt/Firebase-ESP-Client) </br>
Nodejs and firebase-tools installed</br>