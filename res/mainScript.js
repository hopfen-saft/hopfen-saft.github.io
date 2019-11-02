const Http = new XMLHttpRequest();
const url_file_info = "https://api.github.com/repos/akazero200/EB-19/contents/selected.json";
var fileInfo;
var file;
var pin;
var inputCount = 0;
var personID;

//use a random url ending to prevent caching
function randUrl(url) {
  return url+"?v="+Math.random().toString(12).substring(2, 12);
}

function getFileInfo(callback) {
  Http.open("GET", randUrl(url_file_info), true);
  Http.setRequestHeader("Accept", "application/json");
  Http.send();
  Http.onreadystatechange = function() {
    if (Http.readyState == 4 && Http.status == 200) {
      fileInfo = JSON.parse(Http.responseText);
      getFile(callback);
      console.log(fileInfo);
    }
  }
}

function getFile(callback) {
  Http.open("GET", randUrl(fileInfo.git_url), true);
  Http.setRequestHeader("Accept", "application/json");
  Http.send();
  Http.onreadystatechange = function() {
    if (Http.readyState == 4 && Http.status == 200) {
      console.log(Http.responseText);
      var response = JSON.parse(Http.responseText);
      file = JSON.parse(atob(response.content));
      console.log(file);

      if(typeof callback === "function"){
        callback();
      }
    }
  }
}

function fillTable() {
  console.log("filling table");
  const tableBody = document.getElementById('content-table');
  //fill table html elements
  for(i = 0; i < file.selection.length; i++){
    //build one tr
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.scope = "row";
    th.textContent = i+1;
    th.classList.add("border-right");
    tr.appendChild(th);

    //fill td elements
    for(k = 0; k< 4; k++){
      var td = document.createElement("td");

      if(k<file.selection[i].ref.length){ //if  there is an entry -> display it; else -> empty td
        td.textContent = file.selection[i].ref[k];
      }
      tr.appendChild(td);
    }
    //append tr and build next
    tableBody.appendChild(tr);
  }
}

//saving input to json file
function saveSelection(){
  const refTags = {
    ref: [
      document.getElementById('ref0'),
      document.getElementById('ref1'),
      document.getElementById('ref2'),
      document.getElementById('ref3')]
  };

  if(file.part[personID]==pin && file!=null){
    for(i = 0; i<4; i++){
      file.selection[personID].ref[i] = refTags.ref[i].options[refTags.ref[i].selectedIndex].value;
    }
    uploadFile();
    document.getElementById('content-table').innerHTML = '';

    fillTable();
  }
}

function uploadFile() {
  console.log(JSON.stringify(file));
  var encFileContent = btoa(JSON.stringify(file));
  console.log(encFileContent);

  var upload = {
    message: "newly selected",
    sha: fileInfo.sha,
    content: encFileContent,
    committer: { name: "user", email: "example_email@example.com"}
  };

  Http.open("PUT", url_file_info, true);
  Http.setRequestHeader("Accept", "application/json");
  Http.setRequestHeader('Content-Type', "application/json");
  Http.setRequestHeader('Authorization', "token "+getToken());
  Http.send(JSON.stringify(upload));
  Http.onreadystatechange = function() {
    if (Http.readyState == 4 && Http.status == 200) {
      console.log(Http.responseText);
    }
  }
  console.log("upload finished");
}

function addInput(countInput) {
  document.getElementById("groupDiv"+countInput).removeAttribute("hidden");
  if(countInput == 3){
    document.getElementById('addBtn').hidden = "true";
  }
}

function storePin() {
  var output = document.getElementById('nrOutput');
  pin = getGET()['p'];
  var newp = true;

  for(i = 0; i < file.part.length; i++){
    if (file.part[i]==pin) {
      newp = false;
    }
  }

  if(newp && pin!=null){
    file.part[file.part.length] = pin;
    var h2 = document.createElement("h2");
    h2.classList.add("display-5");
    h2.textContent = file.part.length
    output.appendChild(h2);

    uploadFile();
  } else {
    var p = document.createElement("p");
    p.textContent = "Dieser PIN ist leider schon vergeben, bitte überlege dir einen anderen und versuche es erneut!"
    output.appendChild(p);
  }
}

function getGET() {
  var $_GET=[];
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(a,name,value){$_GET[name]=value;});
  return $_GET;
}

function getToken(){
  return atob("YTZlMDE0NmM3OGYyN2U1MGE4MTBjYTljMGI2MDNjNzI2NzQ3ODgzYw==");
}

function logon(){
  var pIDselect = document.getElementById('loginNr');
  inputPID = pIDselect.options[pIDselect.selectedIndex].value-1;
  var inputPIN = document.getElementById('loginPIN').value;

  if(file.part[inputPID]== inputPIN){
    personID = inputPID;
    pin = inputPIN;

    var angemeldet = document.getElementById('angemeldet');
    var angDiv = document.getElementById('angemeldetDiv');
    angDiv.classList.remove("bg-danger");
    angDiv.classList.add("bg-success");

    angemeldet.textContent = "Angemeldet!";
    angemeldet.classList.remove("font-weight-bold");
    angemeldet.classList.add("display-5");

    document.getElementById('angemeldetDesc').hidden = true;

    fillTable();
    console.log("logon success");
  }
}