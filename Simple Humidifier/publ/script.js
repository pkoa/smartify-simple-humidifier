/**
 * look for read hogs, läser förmkt från databasen.
 * 
 * Kan läsa in apinyckeln från början.
*/
const formatter = Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

var setIntervalListener;
var localIp;
var apikey;
document.addEventListener("DOMContentLoaded",event =>{
    const app = firebase.app();
    console.log(app);
    const post = firebase.firestore().collection('localIp').doc('xEOm0I5Pg92qMfiyxMz6');
    post.onSnapshot(doc =>{
        const data = doc.data();
        localIp = data.ip;
        getState();
    })
    const myPost = firebase.firestore().collection('apikeys').doc('OpenWeather');
    myPost.get().then(doc => {
        const data = doc.data();
        apikey = data.key;
    })
    /*
    const db = firebase.firestore()
    const myPost = db.collection('posts').doc('9yaoJZQ68QLSFfoNCeD6')
    let table = document.getElementById('tabledata')
    
    myPost.onSnapshot(doc =>{
            const data = doc.data()
            //document.write(data.awoooga)
            table.innerHTML += `<tr class="table-dark"><td>${data.awoooga}</td><td>${data.views}</td>`
    })*/
    refresh()
    window.setInterval('refresh()', 10000);

    const input = document.querySelector('input[type="search"]')
    if(input.value != ""){
        setIntervalListener = window.setInterval('refreshOthers()', 10000)
    }
});

async function refreshOthers(){
    const input = document.querySelector('input[type="search"]')
    if(input.value != ""){
        fetchData(input)
    }
    else{
        clearInterval(setIntervalListener)
        console.log('CLEAREDD')
    }
}

async function refresh(){
    let table = document.getElementById('tabledata')
    const db = firebase.firestore()

    const latest = await db.collection('esp1_dht').orderBy('id', 'desc').limit(1).get();
    const snapshot = latest.docs[0];
    const data = snapshot.data();
    table.innerHTML = `<tr class="table"><td>${formatter.format(data.temperature)} C</td>
    <td>${data.humidity} %</td>
    <td>${new Date().toTimeString().split('G')[0]}</td>`
}

function googleLogin(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            document.write(`Hello ${user.displayName}`)
            console.log(user)
        })
}

async function fetchData(input){
    /*var apikey;
    const db = firebase.firestore();
    const myPost = db.collection('apikeys').doc('OpenWeather');
    await myPost.get().then(doc => {
        const data = doc.data();
        apikey = data.key;
    })*/
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input.value}&appid=${apikey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            let table = document.getElementById('tabledata3')
            table.innerHTML = `<tr class="table">
            <td>${data.main.temp} C</td>
            <td>${data.main.humidity} %</td>
            <td>${new Date().toTimeString().split('G')[0]}</td>`
            
        })

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input.value}&limit=5&appid=${apikey}`)
        .then(res => res.json())
        .then(data => {
            return fetch(`https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${data[0].lat}&lon=${data[0].lon}`)

            //table.innerHTML += `<tr class="table-dark"><td>${data[0].lat}</td>`

        })
        .then(res => res.json())
        .then(data => {
            let table = document.getElementById('tabledata2')
            table.innerHTML =`<tr class="table">
            <td>${data.properties.timeseries[0].data.instant.details.air_temperature} C</td>
            <td>${data.properties.timeseries[0].data.instant.details.relative_humidity} ${data.properties.meta.units.relative_humidity}</td>
            <td>${new Date(data.properties.meta.updated_at).toTimeString().split('G')[0]}</td>`
            
            //make graph with data
        })

}

/*
    Dra api nyckeln från databasen
**/
function geoCodingCity(event){
    if(event.which == 13){
        clearInterval(setIntervalListener)
        const input = document.querySelector('input[type="search"]');
        fetchData(input);
        setIntervalListener = window.setInterval('refreshOthers()', 10000);
        
    }
}
function localHumUnder(event){
    if(event.which == 13){
        //set hum threshold in db, start hum if under, set timer and shizzle.
    }
}

async function getState(){
    document.getElementById("showbutton").disabled = true;
    document.getElementById("levelbutton").disabled = true;
    document.getElementById("humiditybutton").disabled = true;
    document.getElementById("modebutton").disabled = true;
    document.getElementById("swingbutton").disabled = true;
    document.getElementById("timerbutton").disabled = true;
    document.getElementById("ionizerbutton").disabled = true;

    await fetch(`http://${localIp}/state`)
    .then(res => res.json())
    .then(data =>{
        console.log(data)
        if(data.power == 1){
            document.getElementById("showbutton").className = "btn btn-secondary"
            document.getElementById("showbutton").innerHTML = "Power On"
        }
        else{
            document.getElementById("showbutton").className = "btn btn-outline-secondary"
            document.getElementById("showbutton").innerHTML = "Power Off"
        }
        document.getElementById("showbutton").disabled = false;
        
        if(data.level == 1){
            document.getElementById("levelbutton").className = "btn btn-secondary"
            document.getElementById("levelbutton").innerHTML = "Level 2"
        }
        else if(data.level == 2){
            document.getElementById("levelbutton").className = "btn btn-secondary"
            document.getElementById("levelbutton").innerHTML = "Level 3"
        }
        else{
            document.getElementById("levelbutton").className = "btn btn-secondary"
            document.getElementById("levelbutton").innerHTML = "Level 1"
        }
        document.getElementById("levelbutton").disabled = false;


        if(data.humiditiy == 1){
            document.getElementById("humiditybutton").className = "btn btn-secondary"
            document.getElementById("humiditybutton").innerHTML = "Humidity On"
        }
        else{
            document.getElementById("humiditybutton").className = "btn btn-outline-secondary"
            document.getElementById("humiditybutton").innerHTML = "Humidity Off"
        }
        document.getElementById("humiditybutton").disabled = false;


        if(data.mode == 1){
            document.getElementById("modebutton").className = "btn btn-secondary"
            document.getElementById("modebutton").innerHTML = "Mode: Breeze"
        }
        else if(data.mode == 2){
            document.getElementById("modebutton").className = "btn btn-secondary"
            document.getElementById("modebutton").innerHTML = "Mode: Sleep"
        }
        else{
            document.getElementById("modebutton").className = "btn btn-secondary"
            document.getElementById("modebutton").innerHTML = "Mode: Standard"
        }
        document.getElementById("modebutton").disabled = false;


        if(data.swing == 1){
            document.getElementById("swingbutton").className = "btn btn-secondary"
            document.getElementById("swingbutton").innerHTML = "Swing On"
        }
        else{
            document.getElementById("swingbutton").className = "btn btn-outline-secondary"
            document.getElementById("swingbutton").innerHTML = "Swing Off"
        }
        document.getElementById("swingbutton").disabled = false;


        if(data.timer == 1){
            document.getElementById("timerbutton").className = "btn btn-secondary"
            document.getElementById("timerbutton").innerHTML = "Timer: 1hr"

        }
        else if(data.timer == 2){
            document.getElementById("timerbutton").className = "btn btn-secondary"
            document.getElementById("timerbutton").innerHTML = "Timer: 2hr"

        }
        else if (data.timer == 3){
            document.getElementById("timerbutton").className = "btn btn-secondary"
            document.getElementById("timerbutton").innerHTML = "Timer: 4hr"

        }
        else{
            document.getElementById("timerbutton").className = "btn btn-outline-secondary"
            document.getElementById("timerbutton").innerHTML = "Timer Off"

        }
        document.getElementById("timerbutton").disabled = false;

        
        if(data.ionizer == 1){
            document.getElementById("ionizerbutton").className = "btn btn-secondary"
            document.getElementById("ionizerbutton").innerHTML = "Ionizer On"

        }
        else{
            document.getElementById("ionizerbutton").className = "btn btn-outline-secondary"
            document.getElementById("ionizerbutton").innerHTML = "Ionizer Off"
            
        }
        document.getElementById("ionizerbutton").disabled = false;

    })
}

async function onOff(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/power`, true);
    await ping.send();
    if(document.getElementById("showbutton").innerHTML == "Power On"){
        ping2 = new XMLHttpRequest();
        ping2.open('GET', `http://${localIp}/IR/RESET`, true);
        await ping2.send();
    }
    getState();
}
async function level(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/level`, true);
    await ping.send();
    getState();
    
}
async function humidity(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/hum`, true);
    await ping.send();
    getState();

}
async function mode(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/mode`, true);
    await ping.send();
    getState();

}
async function swing(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/swing`, true);
    await ping.send();
    getState();

}
async function timer(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/timer`, true);
    await ping.send();
    getState();

}
async function ionizer(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/ionizer`, true);
    await ping.send();
    getState();

}
