
require(["./scoreboardTimer"], function(scoreboardTimer){
    var scoreboard,
        currentTime = "00:00",
        noticeMessage = "First quarter",
        blinkTimer = false,
        blinkNr = 0,
        teams = {
            home:{
                name: "Home",
                score: 0
            },
            visitors:{
                name: "Visitors",
                score: 0
            }
        }

    window.generate = function(){
        resetScoreboard();

        scoreboard = scoreboardTimer({
            startTime: document.getElementById("start-time").value || "00:00",
            endTime: document.getElementById("end-time").value || "00:00",

            onStart: onTimerStart,
            onUpdate: onTimerUpdate,
            onStop: onTimerStop
        });
    }

    window.setCurrentTime = function(){
        if(!scoreboard){
            alert("Create scoreboard first!");
            return;
        }

        var time = prompt("Enter current time", currentTime);
        if(time){
            scoreboard.update(time);
            sendUpdate();
        }
    }

    window.incrCurrentTime = function(val){
        if(!scoreboard){
            alert("Create scoreboard first!");
            return;
        }

        scoreboard.increment(val);
        sendUpdate();
    }

    window.changeName = function(team){
        if(!scoreboard){
            alert("Create scoreboard first!");
            return;
        }

        var name = prompt("Enter new name for the team", teams[team].name);
        if(name){
            teams[team].name = name;
            document.getElementById("name-" + team).innerHTML = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            sendUpdate();
        }

    }

    window.changeMessage = function(){
        if(!scoreboard){
            alert("Create scoreboard first!");
            return;
        }

        var notice = prompt("Enter new notice", noticeMessage);
        if(notice){
            noticeMessage = notice;
            document.getElementById("message").innerHTML = notice.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            sendUpdate();
        }

    }

    window.setScore = function(team){
        if(!scoreboard){
            alert("Create scoreboard first!");
            return;
        }

        var score = prompt("Enter new score for " + teams[team].name, teams[team].score || 0);
        if(score){
            score = Number(score) || 0;
            teams[team].score = score;
            document.getElementById("score-" + team).innerHTML = teams[team].score;
            sendUpdate();
        }
    }

    window.incrScore = function(team, score){
        if(!scoreboard){
            alert("Create scoreboard first!");
            return;
        }

        score = Number(score) || 0;
        teams[team].score += score;
        document.getElementById("score-" + team).innerHTML = teams[team].score;
        sendUpdate();
    }

    window.toggleTimer = function(start){
        if(!scoreboard){
            alert("Create scoreboard first!");
            return;
        }

        if(start){
            scoreboard.start();
            clearTimeout(blinkTimer);
            document.getElementById("current-time").className = "timer-started";
        }else{
            scoreboard.stop();
            clearTimeout(blinkTimer);
            blinkTimer = setInterval(function(){
                document.getElementById("current-time").className = "timer-blink-" + (blinkNr++ % 2 ? 0 : 1);
            }, 800);
        }
    }

    function onTimerStart(){
        clearTimeout(blinkTimer);
        document.getElementById("current-time").className = "timer-started";
    }

    function onTimerStop(){
        clearTimeout(blinkTimer);
        document.getElementById("current-time").className = "timer-stopped";
    }

    function onTimerUpdate(value){
        document.getElementById("current-time").innerHTML = currentTime = value;
        sendUpdate();
    }

    function resetScoreboard(){
        if(scoreboard){
            scoreboard.stop();
        }
    }


    function sendUpdate(){
        var data = {
            message: noticeMessage,
            timer: currentTime,
            teams: teams            
        };

        localStorage._scoreboard = JSON.stringify(data, false, 4);
    }
});
