const socket = io();
socket.emit('hasdragons', localStorage.getItem("userToken"), function(msg){
    if(msg){
        location = "/hub"
    }
});
document.querySelectorAll("circle").forEach(function(circle){
    circle.addEventListener("click", function (){
        if (circle.children.length > 0){
            console.log("submitting started...");
            var dino = {
                dino: parseInt(circle.id.split(":")[0]),
                color: parseInt(circle.id.split(":")[1]),
                mfaces: 0,
                faces: [0],
                mshirts: 0,
                shirts: [0],
                mhats: 0,
                hats: [0],
                mshoes: 0,
                shoes: [0]
            };
            socket.emit("setdino", localStorage.getItem("userToken"), dino, function (result){location = "/hub"})
        } else {
            document.querySelectorAll("circle").forEach(function (children) {
                if(children.children.length > 0) {
                    children.children[0].remove();
                }
            })
            document.querySelector(`div[id='${circle.id.split(":")[0]}'] img`).src = `/static/art/dinos/${circle.id.split(":")[0]}/${circle.id.split(":")[1]}.png`;
            var check = document.createElement("i");
            check.className = "fas fa-check";
            circle.appendChild(check);
        }
    });
});