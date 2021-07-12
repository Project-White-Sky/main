var socket = io();
document.getElementById("logupclick").addEventListener("click",function (){
    document.querySelector("fullpage#logupbackdrop").style["display"] = "block";
    document.querySelector("fullpage#logupbackdrop").style["pointer-events"] = "auto";
});
document.querySelector("fullpage#logupbackdrop").addEventListener("click",function (e){
    if (e.target == document.querySelector("fullpage#logupbackdrop")){
        document.querySelector("fullpage#logupbackdrop").style["display"] = "none";
        document.querySelector("fullpage#logupbackdrop").style["pointer-events"] = "none";
    }
});
document.querySelectorAll("#signupsection input").forEach(function (input){
    input.addEventListener("keypress",function (e){
        console.log("bruh");
        if(e.keyCode == 13){
            socket.emit("signup", document.querySelector("#signupsection input[type='username']").value, document.querySelector("#signupsection input[type='password']").value, document.querySelector("#signupsection input[type='email']").value, function (response) {
                if(response[0] == false){
                    alert(response[1]);
                    return;
                }
                localStorage.setItem("userToken",response[1]);
                location = location;
            });
        }
    })
});
document.querySelectorAll("#loginsection input").forEach(function (input){
    input.addEventListener("keypress",function (e){
        if(e.keyCode == 13){
            socket.emit("login", document.querySelector("#loginsection input[type='email']").value, document.querySelector("#loginsection input[type='password']").value, function (response) {
                if(response[0] == false){
                    alert(response[1]);
                    return;
                }
                localStorage.setItem("userToken",response[1]);
                location = location;
            });
        }
    })
});
document.getElementById("loginbutton").addEventListener("click", function (e) {
    socket.emit("login", document.querySelector("#loginsection input[type='email']").value, document.querySelector("#loginsection input[type='password']").value, function (response) {
        if(response[0] == false){
            alert(response[1]);
            return;
        }
        localStorage.setItem("userToken",response[1]);
        location = location;
    });
});
document.getElementById("signupbutton").addEventListener("click", function (e) {
    socket.emit("signup", document.querySelector("#signupsection input[type='username']").value, document.querySelector("#signupsection input[type='password']").value, document.querySelector("#signupsection input[type='email']").value, function (response) {
        if(response[0] == false){
            alert(response[1]);
            return;
        }
        localStorage.setItem("userToken",response[1]);
        location = location;
    });
});