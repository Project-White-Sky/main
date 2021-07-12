document.getElementById("logoutclick").addEventListener("click", function(){
    localStorage.clear();
    location = location;
});
if (localStorage.getItem("userToken")){
    if (location.pathname == "/") {
        location = "/hub"
    }
    document.getElementById("logupclick").remove();
    refreshCoins()
} else {
    if(location.pathname != "/"){
        location ="/"
    }
    document.getElementById("headercoin").remove();
    document.getElementById("logoutclick").remove();
}
document.getElementById("tohub").addEventListener("click", function () {
    location = "/hub";
})
function refreshCoins(){
    socket.emit('getcoins', localStorage.getItem("userToken"), function (result) {
        document.querySelector("header h2.coincounter").innerText = result;
    })
}