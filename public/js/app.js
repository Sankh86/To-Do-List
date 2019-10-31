// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyBgO_bFn-J5R4KizS5NsOGYkqLWElCFrHw',
    authDomain: 'https://to-do-list-f6f5c.firebaseio.com',
    projectId: 'to-do-list-f6f5c'
});

const db = firebase.firestore();
const auth = firebase.auth();
var listObj = "";
var loggedin = false;
var listid = "";
var welcome = "";


// ***** Header Listeners & Sign Up *****
const account = document.querySelector("#account");
const logout = document.querySelector("#logout");
const login = document.querySelector("#login");
const newuser= document.querySelector("#newuser");
const cancelacctbtn = document.querySelector("#cancelacctbtn");
const acctform = document.querySelector("#acctform");
const loginmenu = document.querySelector("#loginmenu");
const loginemail = document.querySelector("#loginemail");


login.addEventListener('click', function () {
    if (loginmenu.style.display === "block") {
        loginmenu.style.display = "none";
    } else {
        loginmenu.style.display = "block";
        loginemail.focus();
        loginemail.select();
    }
});

newuser.addEventListener('click', function () {
    loginmenu.style.display = "none";
    acctform.style.display = "block";
});

cancelacctbtn.addEventListener('click', function () {
    acctform.style.display = "none";
});


// ********** New Users, Login, & Authentication **********

// ***** Create New User & Log In *****
const newuserform = document.querySelector("#newuser-form");
newuserform.addEventListener('submit', function (e) {
    e.preventDefault();

    let email = document.getElementById("newuser-email").value
    let pw = document.getElementById("newuser-pw").value
    let firstname = document.getElementById("newuser-firstname").value

    auth.createUserWithEmailAndPassword(email, pw).then(cred => {
        acctform.style.display = "none";
        newuserform.reset();

        let user = auth.currentUser;
        let uid = user.uid;

        user.updateProfile({displayName: firstname});
        db.collection("Users").doc(uid).set({ complete: [ ], critnpress: [ ], critpress: [ ], ncritnpress: [ ], ncritpress: [ ] });

    //   .catch(function(error) {
    //     // Handle Errors here.
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     // ...
    //   });

        console.log("User Created");
    });
});

// ***** Login *****
const loginform = document.querySelector("#loginform")

loginform.addEventListener('submit', function (e) {
    e.preventDefault();

    let loginform = document.getElementById("loginform");
    let email = document.getElementById("loginemail").value;
    let pw = document.getElementById("loginpw").value;

    auth.signInWithEmailAndPassword(email, pw).then(cred => {
        console.log("User Logged In")

        loginmenu.style.display = "none";
        loginform.reset();
    });
});



// ***** Logout *****
logout.addEventListener('click', function () {
    auth.signOut().then(() => {
        console.log('User Logged Out')

    });
});

// ***** Auth State Changes *****
    auth.onAuthStateChanged(user => {
        if(user) {
            listid = user.uid;
            let displayname = user.displayName;
            loggedin = true;
            document.getElementById("welcome").innerHTML = "Hey " + displayname + ", what are we working on today?";
            account.style.display = "inline";
            logout.style.display = "inline";
            login.style.display = "none";
            db.collection("Users").doc(listid).get().then((snapshot) => {
                listObj = snapshot.data();
                populateLists();
            });

        } else {
            listid = "";
            loggedin = false;
            document.getElementById("welcome").innerHTML = "Welcome, sign in to see your to do list!";
            account.style.display = "none"
            logout.style.display = "none"
            login.style.display = "inline"
            listObj = {"critpress":["Work on Thing","Big Project","Extra Work","Final Countdown"],"ncritpress":["Session Prep","Big Thing","Work with Steve"],"critnpress":["Check Stocks","Get it Done","Keep Cool","List Things"],"ncritnpress":["Bring It","Simmer Down","Walk the Line","Learn Skill"],"complete":["Find To Do App","Stress Over Life","Work on Stuff"]};
            populateLists();
        }
    });


// ********** Site Functionality **********

// ***** Show & Hide Completed Items *****

function showComplete() {
    document.getElementById("completelist").style.display = "block";
    document.getElementById("showcomplete").style.display = "none";
}

function hideComplete() {
    document.getElementById("completelist").style.display = "none";
    document.getElementById("showcomplete").style.display = "inline";
}

// ***** Move Up Button *****
const moveUp = function () {
    let wrapper = this.parentElement.parentElement;
    let nodeList = wrapper.parentElement.id;

    if (document.querySelector("#delnode") !== null) {
        let dnode = document.getElementById("delnode")
        dnode.parentNode.removeChild(dnode)
    }

    if (wrapper.previousElementSibling) {
        let currentitm = this.parentElement.nextSibling.nodeValue;
        let swapitm = this.parentElement.parentElement.previousElementSibling.childNodes[1].nodeValue;
        let itmIndex = listObj[nodeList].indexOf(currentitm);

        listObj[nodeList][itmIndex] = swapitm;
        listObj[nodeList][itmIndex - 1] = currentitm;

        if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
        populateLists();
    }
};

// ***** Move Down Button *****
const moveDown = function () {
    let wrapper = this.parentElement.parentElement;
    let nodeList = wrapper.parentElement.id;

    if (document.querySelector("#delnode") !== null) {
        let dnode = document.getElementById("delnode")
        dnode.parentNode.removeChild(dnode)
    }

    if (wrapper.nextElementSibling) {
        let currentitm = this.parentElement.nextSibling.nodeValue;
        let swapitm = this.parentElement.parentElement.nextElementSibling.childNodes[1].nodeValue;
        let itmIndex = listObj[nodeList].indexOf(currentitm);

        listObj[nodeList][itmIndex] = swapitm;
        listObj[nodeList][itmIndex + 1] = currentitm;

        if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
        populateLists();
    }
};

// ***** Change Criticality Button *****
const changeCrit = function () {
    let wrapper = this.parentElement.parentElement;
    let nodeList = wrapper.parentElement.id;
    let currentitm = this.parentElement.previousSibling.nodeValue;
    let itmIndex = listObj[nodeList].indexOf(currentitm)
    let newParent = ""

    if (document.querySelector("#delnode") !== null) {
        let dnode = document.getElementById("delnode")
        dnode.parentNode.removeChild(dnode)
    }

    if (wrapper.parentElement.id.indexOf("ncrit") === -1) {
        newParent = "ncrit";
    } else {
        newParent = "crit";
    }
    if (wrapper.parentElement.id.indexOf("npress") === -1) {
        newParent += "press";
    } else {
        newParent += "npress";
    }

    listObj[nodeList].splice(itmIndex, 1);
    listObj[newParent].push(currentitm);

    if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
    populateLists();
};

// ***** Change Timeliness Button *****
const changeTime = function () {
    let wrapper = this.parentElement.parentElement;
    let nodeList = wrapper.parentElement.id;
    let currentitm = this.parentElement.previousSibling.nodeValue;
    let itmIndex = listObj[nodeList].indexOf(currentitm)
    let newParent = ""

    if (document.querySelector("#delnode") !== null) {
        let dnode = document.getElementById("delnode")
        dnode.parentNode.removeChild(dnode)
    }

    if (wrapper.parentElement.id.indexOf("ncrit") === -1) {
        newParent = "crit";
    } else {
        newParent = "ncrit";
    }
    if (wrapper.parentElement.id.indexOf("npress") === -1) {
        newParent += "npress";
    } else {
        newParent += "press";
    }

    listObj[nodeList].splice(itmIndex, 1);
    listObj[newParent].push(currentitm);

    if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
    populateLists();
}

// ***** Trash Button *****
const throwAway = function () {
    let wrapper = this.parentElement.parentElement;
    let nodeList = wrapper.parentElement.id;
    let currentitm = this.parentElement.previousSibling.nodeValue;
    let itmIndex = listObj[nodeList].indexOf(currentitm)
    let delnode = document.createElement("LI");
    let askremove = document.createTextNode("Remove: " + currentitm + "?");
    let yesno = document.createElement("SPAN");
    let yesdel = document.createElement("BUTTON");
    let sayyes = document.createTextNode("Remove");
    let nodel = document.createElement("BUTTON");
    let sayno = document.createTextNode("Cancel");
    let completelist = document.createElement("BUTTON");
    let saycomplete = document.createTextNode("Complete");

    if (document.querySelector("#delnode") !== null) {
        let dnode = document.getElementById("delnode")
        dnode.parentNode.removeChild(dnode)
    }

    if(nodeList === "complete") {
        listObj[nodeList].splice(itmIndex, 1);
        if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
        populateLists()
    } else {

        yesdel.appendChild(sayyes);
        nodel.appendChild(sayno);
        completelist.appendChild(saycomplete);
        yesdel.classList.add("yesdel")
        nodel.classList.add("nodel")
        completelist.classList.add("movcomplete")
        delnode.appendChild(askremove);
        yesno.classList.add("delBtnSpan")
        yesno.appendChild(completelist);
        yesno.appendChild(yesdel);
        yesno.appendChild(nodel);
        delnode.appendChild(yesno);
        delnode.setAttribute("id", "delnode")

        wrapper.parentNode.insertBefore(delnode, wrapper.nextElementSibling);

        const cancelbtn = document.querySelector(".nodel");

        cancelbtn.addEventListener('click', function () {
            let dnode = document.getElementById("delnode")
            dnode.parentNode.removeChild(dnode)
        });

        const removebtn = document.querySelector(".yesdel");

        removebtn.addEventListener('click', function () {
            let dnode = document.getElementById("delnode")
            dnode.parentNode.removeChild(dnode)

            listObj[nodeList].splice(itmIndex, 1);

            if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
            populateLists()
        });

        let completebtn = document.querySelector(".movcomplete");

        completebtn.addEventListener('click', function () {
            let dnode = document.getElementById("delnode")
            dnode.parentNode.removeChild(dnode)

            listObj[nodeList].splice(itmIndex, 1);
            listObj["complete"].push(currentitm);
            if(listObj["complete"].length > 30) {
                let cut = listObj["complete"].length - 30;
                listObj["complete"].splice(0, cut);
            }

            if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
            populateLists()
        });
    }
}

// ********** Create/Update List Items **********
function populateLists() {
    let list = ""
    let node = ""
    let taskinfo = ""
    let navbar = ""
    let navup = ""
    let navdwn = ""
    let shftbar = ""
    let impshft = ""
    let timeshft = ""
    let trash = ""

    for (prop in listObj) {
        list = document.getElementById(prop);
        list.innerHTML = "";
    }

    for (prop in listObj) {

        if (prop !== "complete") {
            list = document.getElementById(prop);

            for (j = 0; j < listObj[prop].length; j++) {
                node = document.createElement("LI");
                navbar = document.createElement("SPAN");
                navup = document.createElement("IMG");
                navdwn = document.createElement("IMG");
                shftbar = document.createElement("SPAN");
                impshft = document.createElement("IMG");
                timeshft = document.createElement("IMG");
                trash = document.createElement("IMG");
                taskinfo = document.createTextNode(listObj[prop][j]);

                navbar.classList.add("updown");
                navup.classList.add("reorder", "btn", "up");
                navup.setAttribute("src", "img/aiga_up_arrow.png");
                navup.setAttribute("title", "Move Up")
                navdwn.classList.add("reorder", "btn", "down");
                navdwn.setAttribute("src", "img/aiga_down_arrow.png");
                navdwn.setAttribute("title", "Move Down")
                impshft.classList.add("shift-itm", "btn", "critshift");
                impshft.setAttribute("src", "img/important.png");
                impshft.setAttribute("title", "Change Importance")
                timeshft.classList.add("shift-itm", "btn", "timeshift");
                timeshft.setAttribute("src", "img/clock.png");
                timeshft.setAttribute("title", "Change Timeframe")
                trash.classList.add("trash", "btn");
                trash.setAttribute("src", "img/trash.png");
                trash.setAttribute("title", "Remove Item")

                navbar.appendChild(navup);
                navbar.appendChild(navdwn);
                shftbar.appendChild(impshft);
                shftbar.appendChild(timeshft);
                shftbar.appendChild(trash);
                node.appendChild(navbar);
                node.appendChild(taskinfo);
                node.appendChild(shftbar);

                list.appendChild(node);
            }
        }
    }

    for (i = 0; i < listObj["complete"].length; i++) {
        list = document.getElementById("complete");
        node = document.createElement("LI");
        navbar = document.createElement("SPAN");
        shftbar = document.createElement("SPAN");
        trash = document.createElement("IMG");
        taskinfo = document.createTextNode(listObj["complete"][i]);

        trash.classList.add("trash", "btn", "comptrash");
        trash.setAttribute("src", "img/trash.png");
        trash.setAttribute("title", "Remove Item")

        shftbar.appendChild(trash);
        node.appendChild(navbar);
        node.appendChild(taskinfo);
        node.appendChild(shftbar);

        list.appendChild(node);
    }

    const upLink = document.querySelectorAll(".up");
    const downLink = document.querySelectorAll(".down");
    const critLink = document.querySelectorAll(".critshift");
    const timeLink = document.querySelectorAll(".timeshift");
    const trashLink = document.querySelectorAll(".trash");

    for (var i = 0; i < upLink.length; i++) {
        upLink[i].addEventListener('click', moveUp);
    }

    for (var i = 0; i < downLink.length; i++) {
        downLink[i].addEventListener('click', moveDown);
    }

    for (var i = 0; i < critLink.length; i++) {
        critLink[i].addEventListener('click', changeCrit);
    }

    for (var i = 0; i < timeLink.length; i++) {
        timeLink[i].addEventListener('click', changeTime);
    }

    for (var i = 0; i < trashLink.length; i++) {
        trashLink[i].addEventListener('click', throwAway);
    }
}

// Add Task
const submitTask = document.querySelector("#submitTask");

submitTask.addEventListener('click', function () {
    let addlist = document.getElementById("addlist").value;
    let newtask = document.getElementById("newtask").value;

    if (newtask !== null) {
        listObj[addlist].push(newtask);
        document.getElementById("newtask").value = null;

        if (loggedin) {db.collection("Users").doc(listid).set(listObj)};
        populateLists();
    }

});