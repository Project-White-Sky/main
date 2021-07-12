var socket = io();
socket.emit("userinfo", localStorage.getItem("userToken"), function (result) {
    if (!result) {
        localStorage.clear();
    } else {
        if(Object.keys(result.yourdinos[0]).length == 0) {
            location = "/northpole"
        }
        document.getElementById("welcomemsg").innerText = `Hello there ${result.username}`;
        for (var i=0;i<result.schedule.length;i++) {
            scheadd(result.schedule[i])
        }
        var dinos = result.yourdinos;
        document.getElementById("dragonimage").src = `/static/art/dinos/${dinos[0].dino}/${dinos[0].color}.png`;
        document.getElementById("hat").src = `/static/art/hats/${dinos[0].mhats}/${dinos[0].dino}.png`;
        document.getElementById("face").src = `/static/art/faces/${dinos[0].mfaces}/${dinos[0].dino}.png`;
        document.getElementById("shirt").src = `/static/art/shirts/${dinos[0].mshirts}/${dinos[0].dino}.png`;
        document.getElementById("shoes").src = `/static/art/shoes/${dinos[0].mshoes}/${dinos[0].dino}.png`;
        var select = document.querySelector("#dinoinformation select#dinotype");
        for(i=0;i<dinos.length;i++){
            var option = document.createElement("option");
            option.setAttribute("value",i+1);
            var type = ""
            if(dinos[i].dino == 1){
                type = "T-Rex"
            }else if(dinos[i].dino == 2){
                type = "Stegasaurus"
            }else{
                type = "Brachiosaurus"
            }
            option.innerText = type;
            select.appendChild(option);
        }
    }
})
function scheadd(schedule){
    var table = document.querySelector('table tbody');
    var tr = document.createElement('tr');
    var time = document.createElement('td');
    time.setAttribute('style', 'width:20vh; max-width: 24vh;');
    time.innerText = schedule.time;
    var activity = document.createElement('td');
    activity.innerText = schedule.activity;
    activity.setAttribute('style', "width: calc((96vw - 30vh) * 5 / 8); max-width: calc((96vw - 34vh) * 5 / 8);");
    var goal = document.createElement('td');
    goal.innerText = schedule.goal;
    goal.setAttribute('style', "width: calc((96vw - 30vh ) * 3 / 8);max-width: calc((96vw - 34vh) * 5 / 8);");
    var donecontainer = document.createElement('td');
    donecontainer.setAttribute('style', "width:10vh;max-width:14vh;");
    if (!schedule.done) {
        var donecheck = document.createElement('input');
        donecheck.type = "checkbox";
        donecheck.checked = schedule.done;
        donecheck.addEventListener("change", function (e) {
            socket.emit('addcoin',localStorage.getItem("userToken"),5,function (result){
                console.log(result);
                document.querySelector("h2.coincounter").innerText = result;
            })
            var trash = document.createElement('i');
            trash.style["color"] = "white";
            var a = document.createElement('a');
            a.className = "trashcontainer";
            a.addEventListener("click", function (e){
                if (e.path[0].className == "trashcontainer"){
                    e.path[0].parentNode.parentNode.parentNode.remove();
                } else {
                    e.target.parentNode.parentNode.parentNode.parentNode.remove();
                }
                schesave();
            })
            trash.className = "fas fa-trash centered pointer";
            var parent = e.target.parentNode;
            e.target.remove();
            a.appendChild(trash)
            parent.appendChild(a);
            schesave();
        })
        donecontainer.appendChild(donecheck);
    } else {
        var trash = document.createElement('i');
        var a = document.createElement('a')
        a.className = "trashcontainer";
        trash.className = "fas fa-trash centered pointer";
        trash.style["color"] = "white";
        a.addEventListener("click", function(e){
            if (e.path[0].className == "trashcontainer"){
                e.path[0].parentNode.parentNode.parentNode.remove();
            } else {
                e.target.parentNode.parentNode.parentNode.parentNode.remove();
            }
            schesave();
        })
        a.appendChild(trash)
        donecontainer.appendChild(a)
    }
    tr.appendChild(time);
    tr.appendChild(activity);
    tr.appendChild(goal);
    tr.appendChild(donecontainer);
    for(i=0;i<tr.children.length - 1;i++){
        if(tr.children[i].children.length ==  0 ){
            tr.children[i].contentEditable = "true";
        }
        tr.children[i].addEventListener("change", function () {
            schesave()
        })
        tr.children[i].addEventListener("input", function () {
            schesave()
        })
    }
    table.appendChild(tr);
    schesave()
}
function schesave () {
    var list = [];
    document.querySelectorAll("tr").forEach(function (tr) {
        if (tr.id == "ignoremesche") {
            return  
        }
        var done = (tr.children[3].children[0].getAttribute("class") === "trashcontainer");
        var object = {
            time: tr.children[0].innerText,
            activity: tr.children[1].innerText,
            goal: tr.children[2].innerText,
            done: done
        }
        list.push(object);
    })
    socket.emit("savesche", localStorage.getItem("userToken"), list, function(result){
        if(result[0]) {
            document.querySelector("textarea#achievementstrigger").value= "a";
            document.querySelector("img#achievementbadgemain").src = "/static/images/"+result[2];
            document.querySelector("h2#achievementname").innerText = result[1];
            
        }
    });
    return;
}
document.getElementById("addcolumn").addEventListener("click", function (){
    scheadd({
        time: "12:00-12:00",
        activity: "Your Subject/Project",
        goal: "Your Goal For The Session",
        done: false
    })
})
document.querySelector("x").addEventListener("click", function (){
    document.querySelector("textarea#achievementstrigger").value = "";
})