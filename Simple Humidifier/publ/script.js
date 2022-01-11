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
var humidityIntervalListener;
var localIp;
var apikey;
var currentState;
document.addEventListener("DOMContentLoaded",event =>{
    const app = firebase.app();
    console.log(app);
    const post = firebase.firestore().collection('localIp').doc('xEOm0I5Pg92qMfiyxMz6');
    post.onSnapshot(doc =>{
        const data = doc.data();
        localIp = data.ip;
        
    })
    const myPost = firebase.firestore().collection('apikeys').doc('OpenWeather');
    myPost.get().then(doc => {
        const data = doc.data();
        apikey = data.key;
    })
    const myPost2 = firebase.firestore().collection('esp-controller').doc('wantedstate');
    myPost2.get().then(doc =>{
        const data = doc.data();
        console.log(data);
        //document.write(data);
    })
    const myPost3 = firebase.firestore().collection('esp-controller').doc('state');
    myPost3.onSnapshot(doc =>{
        const data = doc.data();
        currentState = data;
        console.log(data)
    })
    refresh()
    window.setInterval('refresh()', 10000);

    const input = document.querySelector('input[type="search"]')
    if(input.value != ""){
        setIntervalListener = window.setInterval('refreshOthers()', 10000)
    }

    firebase.firestore().collection('esp-controller').doc('state')
    .onSnapshot(doc =>{

        disableButtons();

        var data = doc.data()
        console.log(data)
        if(data.power == 1){
            document.getElementById("showbutton").className = "btn btn-secondary"
            document.getElementById("showbutton").innerHTML = "Power On"

            document.getElementById("levelbutton").style.visibility = "visible";
            document.getElementById("humiditybutton").style.visibility = "visible";
            document.getElementById("modebutton").style.visibility = "visible";
            document.getElementById("swingbutton").style.visibility = "visible";
            document.getElementById("timerbutton").style.visibility = "visible";
            document.getElementById("ionizerbutton").style.visibility = "visible";

        }
        else{
            document.getElementById("showbutton").className = "btn btn-outline-secondary"
            document.getElementById("showbutton").innerHTML = "Power Off"
            document.getElementById("showbutton").disabled = false;
            /*
            document.getElementById("levelbutton").style.visibility = "hidden";
            document.getElementById("humiditybutton").style.visibility = "hidden";
            document.getElementById("modebutton").style.visibility = "hidden";
            document.getElementById("swingbutton").style.visibility = "hidden";
            document.getElementById("timerbutton").style.visibility = "hidden";
            document.getElementById("ionizerbutton").style.visibility = "hidden";

            return;*/
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


        if(data.hum == 1){
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
});

async function refreshOthers(){
    const input = document.querySelector('input[type="search"]')
    if(input.value != ""){
        fetchData(input)
    }
    else{
        clearInterval(setIntervalListener)
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
function localHumUnder(){

    //set hum threshold in db, start hum if under, set timer and shizzle.
    /**
     * tier 1
    */
    //const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');
    clearInterval(humidityIntervalListener);
    const input = document.querySelector('input[type="set"]');
    console.log(input.value);
    document.getElementById("localunderbutton").className = "btn btn-secondary"
    document.getElementById("localunderbutton").innerHTML = "Set!"
    refreshHumidity();
    humidityIntervalListener = window.setInterval('refreshHumidity()', 120000);
}

async function refreshHumidity(){
    const latest = await firebase.firestore().collection('esp1_dht').orderBy('id', 'desc').limit(1).get();
    const snapshot = latest.docs[0];
    const data = snapshot.data();
    const input = document.querySelector('input[type="set"]');
    
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    if(data.humidity < input.value){
        await myPost.update({power: 1});
        await myPost.update({hum: 1});
        await myPost.update({swing: 1});
        pingLocal();
    }
    else{
        reset();
        clearInterval(humidityIntervalListener)
    }
}

async function onOff(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    console.log(currentState.power)
    if(currentState.power == 0){
        const res = await myPost.update({power: 1});
    }
    else{
        const res = await myPost.update({power: 0});
        reset();
    }
    pingLocal();
}
async function level(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    console.log(currentState.level)
    if(currentState.level == 0){
        const res = await myPost.update({level: 1});
    }
    else if(currentState.level == 1){
        const res = await myPost.update({level: 2});
    }
    else{
        const res = await myPost.update({level: 3});
    }
    pingLocal();
    
}
async function humidity(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    console.log(currentState.hum)
    if(currentState.hum == 0){
        const res = await myPost.update({hum: 1});
    }
    else{
        const res = await myPost.update({hum: 0});
    }
    pingLocal();
}
async function mode(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    console.log(currentState.mode)
    if(currentState.mode == 0){
        const res = await myPost.update({mode: 1});
    }
    else if(currentState.mode == 1){
        const res = await myPost.update({mode: 2});
    }
    else{
        const res = await myPost.update({mode: 0});
    }
    pingLocal();
}
async function swing(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    console.log(currentState.swing)
    if(currentState.swing == 0){
        const res = await myPost.update({swing: 1});
    }else{
        const res = await myPost.update({swing: 0});
    }
    pingLocal();
}
async function timer(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    console.log(currentState.timer)
    if(currentState.timer == 0){
        const res = await myPost.update({timer: 1});
    }
    else if(currentState.timer == 1){
        const res = await myPost.update({timer: 2});
    }
    else{
        const res = await myPost.update({timer: 0});
    }
    pingLocal();
}
async function ionizer(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');

    console.log(currentState.ionizer)
    if(currentState.ionizer == 0){
        const res = await myPost.update({ionizer: 1});
    }else{
        const res = await myPost.update({ionizer: 0});
    }
    pingLocal();
}
async function reset(){
    const myPost = firebase.firestore().collection('esp-controller').doc('wantedstate');
    
    console.log(currentState)
    await myPost.update({ionizer: 0});
    await myPost.update({power: 0});
    await myPost.update({timer: 0});
    await myPost.update({swing: 0});
    await myPost.update({level: 0});
    await myPost.update({hum: 0});
    await myPost.update({mode: 0});

    disableButtons();
    pingLocal();
}

async function pingLocal(){
    /*ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}`, true);
    await ping.send();*/

    
}

async function disableButtons(){
    document.getElementById("showbutton").disabled = true;
    document.getElementById("levelbutton").disabled = true;
    document.getElementById("humiditybutton").disabled = true;
    document.getElementById("modebutton").disabled = true;
    document.getElementById("swingbutton").disabled = true;
    document.getElementById("timerbutton").disabled = true;
    document.getElementById("ionizerbutton").disabled = true;
    document.getElementById("resetbutton").disabled = true;
    document.getElementById("resetbutton").disabled = false;
    

}

async function enableButtons(){
    document.getElementById("showbutton").disabled = false;
    document.getElementById("levelbutton").disabled = false;
    document.getElementById("humiditybutton").disabled = false;
    document.getElementById("modebutton").disabled = false;
    document.getElementById("swingbutton").disabled = false;
    document.getElementById("timerbutton").disabled = false;
    document.getElementById("ionizerbutton").disabled = false;
    document.getElementById("resetbutton").disabled = false;
 
}

/* Old method of controlling */
/*
async function onOff(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/power`, true);
    await ping.send();
    if(document.getElementById("showbutton").innerHTML == "Power On"){
        ping2 = new XMLHttpRequest();
        ping2.open('GET', `http://${localIp}/IR/RESET`, true);
        await ping2.send();
    }
    
}
async function level(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/level`, true);
    await ping.send();
    
    
}
async function humidity(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/hum`, true);
    await ping.send();
    

}
async function mode(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/mode`, true);
    await ping.send();
    

}
async function swing(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/swing`, true);
    await ping.send();
    

}
async function timer(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/timer`, true);
    await ping.send();
    

}
async function ionizer(){
    ping = new XMLHttpRequest();
    ping.open('GET', `http://${localIp}/IR/ionizer`, true);
    await ping.send();
    

}
*/