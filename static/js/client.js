
require([], function(){
    
    window.addEventListener("storage", function (e){
        var data;
        if(e.key == "_scoreboard"){
            checkUpdate();
        }
    }, false);

    function checkUpdate(){
        try{
            data = JSON.parse(localStorage._scoreboard);
        }catch(E){
            console.log(E.message)
        }
        if(data){
            paintData(data);
        }
    }
    
    function paintData(data){

        document.getElementById("message").innerHTML = sanitize(data.message || "First quarter");
        document.getElementById("timer").innerHTML = sanitize(data.timer || "00:00");

        document.getElementById("name-home").innerHTML = sanitize(data.teams.home.name || "Home");
        document.getElementById("score-home").innerHTML = sanitize(data.teams.home.score || "0");

        document.getElementById("name-visitors").innerHTML = sanitize(data.teams.visitors.name || "Visitors");
        document.getElementById("score-visitors").innerHTML = sanitize(data.teams.visitors.score || "0");

    }

    function sanitize(value){
        return (value || "").toString().trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    checkUpdate();
});