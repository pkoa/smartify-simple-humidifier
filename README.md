# simple-humidifier
*Gives smart control over your dumb humidifier💧*

## Overview
### Background
This project was born out of a want and need to automate the humidity in my room.</br>
I have eczema which gets really bad during the cold, dry months. To combat this I bought a fan/humidifier that would cool down the room during the summer and humidify the room during the winter. This worked well during the summer, mostly since I left the machine on day and night, however during the winter leaving it on dayround wasn't an option. I wanted more granular control over the humidifier, with the ability to schedule depending on humidity or temperature, but the remote that came with it was quite basic and the device itself was not smart.</br>
So instead going through the pain of either buying a new humidifier with the functionallity I wanted or getting used to checking the current humidity and using the basic remote to control the device every time, I created this project.
### How does it work?
![flowchart](images/simple-humidifier-flow.png)</br>
This project makes use of two microcontrollers: 
* one ESP32 to collect temperature and humidity data, with the ability to add more devices quite easily.
* one ESP8266 to control the humidifier using an IR led.


The collector sends the collected data to firebase, which acts as both database- and website- host.</br>
The website pulls data from the database and open weatherapis(openweatherapi and yr). These can be used to give an overview of how the humidity will rise or fall and can be taken into consideration when controlling the humidifier.</br>
For the future of this project I want to add the ability to create and edit schedules for the humidifier based on the data collected. I also plan to add "smart" scheduling based on weather forecasts with the help of YRs forecast api. </br>
There could also come a point where I add machine learning to this project, but I think thats ways away and since there are open apis with forecasts out there I will stick to using these instead.</br></br>
The current website design looks like this: </br>![website](images/website.png)</br>
