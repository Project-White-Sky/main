const socket = io();
socket.emit("shopdataforuser", localStorage.getItem("userToken"), function (results) {
    for(var i=0;i<results.length;i++){
        createShopItem(results[i])
    }
})
function createShopItem (item) {
   console.log(item.dino)
    var container = document.getElementById("container");
    var shopcard = document.createElement("shopcard");
    var imghitbox = document.createElement("imghitbox");
    var dino = document.createElement("img");
    dino.src = `/static/art/dinos/${item.dino}/${item.color}.png`;
    var img = document.createElement("img");
    img.src = `/static/art/${item.kind}/${item.item}/${item.dino}.png`;
    img.style["z-index"] = 999999;
    var div = document.createElement("div");
    var h1 = document.createElement("h1");
    h1.innerText = item.name;
    var p = document.createElement("p");
    p.innerText = item.descr;
    var price = document.createElement("p");
    price.innerText = `$${item.price}`;
    var button = document.createElement("button");
    console.log(item.owned);
    console.log(item.equipped);
    if(item.owned) {
        if (!item.equipped){
            button.innerText = "Bought";
        } else {
            button.innerText = "Equipped";
        }
    } else {
        button.innerText = "Buy";
        button.setAttribute("kind", item.kind)
        button.setAttribute("item", item.item)
        button.addEventListener("click", function (e) {
            socket.emit("buyitem", localStorage.getItem("userToken"), e.target.getAttribute("kind"), e.target.getAttribute("item"), function(results){
                if(results[0]) {
                    location = location
                } else {
                    alert(results[1])
                }
            })
        })
    }
    div.appendChild(h1);
    div.appendChild(p);
    div.appendChild(price);
    div.appendChild(button);
    shopcard.appendChild(imghitbox);
    shopcard.appendChild(dino);
    shopcard.appendChild(img);
    shopcard.appendChild(div);
    container.appendChild(shopcard);
}