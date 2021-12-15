# simple-humidifier
*Gives smart control over your dumb humidifier💧*

## Overview
### Background
This project was born out of a want and need to automate the humidity in my room.</br>
I have eczema which gets really bad during the cold, dry months. To combat this I bought a fan/humidifier that would cool down the room during the summer and humidify the room during the winter. This worked well during the summer because I left the machine on day and night. During the winter I wanted more granular control over the humidifier, but the remote that came with it was quite basic and the device itself was not smart.</br>
So instead of the headpain of either buying a new humidifier with the functionallity I wanted or getting used to checking the current humidity and using the basic remote to control the device every time, I created this project.
### What does it do?
![flowchart](/simple-humidifier-flow.png)</br>
This project makes use of two microcontrollers: 
* one ESP32 to collect temperature and humidity data, with the ability to add more devices
* one ESP8266 to control the humidifier using an IR led.


It sends the collected data to firebase, which acts as both database- and website- host.</br>
The website pulls data from open weatherapis(openweatherapi and yr) to display and consider when controlling the humidifier.</br>
There is also the posibility to add schedules based on the collected data, as well as plans to add smart scheduling based on weatherforecasts and machine learning</br>
The current website design looks like this: img</br>
