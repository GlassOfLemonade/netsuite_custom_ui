// Used to load data from NetSuite into info panel
var infoUrl = "/app/site/hosting/restlet.nl?script=scriptNum&deploy=1";
//var debugText = document.getElementById("debugText");
var addButton = document.getElementById("startButton").addEventListener("click", GetInfoRESTlet);
var iTableBody = document.getElementById("infoTableBody");

function GetInfoRESTlet() {
    var appendedURL = infoUrl + "&itemid=" + hidden_itemField.value;
    var request = new XMLHttpRequest();
    request.open('GET', appendedURL, true);
    // set headers
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "*/*");

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // request succeeded
            var data = JSON.parse(request.responseText);
            console.log("Data received from RESTlet!<--Info Table-->");
            console.log("Data: " + JSON.stringify(data));

            //process data here
            try{
                // empty table of all data
                EmptyInfoFields();
                // append data to table
                AppendInfoTable(data);
            }
            catch(e) {
                console.log("Error has occured while appending data to info table!");
                console.log("Error: " + e.message);
            }
        }
        else {
            // server reached but error returned
            console.log("Status: " + request.status);
            console.log("Message: " + request.statusText);
        }   
    };

    request.onerror = function() {
        // there was an error with the request, process that error here
        console.log("There was an error trying to reach the server.");
    };

    request.send();
}

function AppendInfoTable(dataArray) {
    for (let obj of dataArray) {
        //insert row
        var newRow = iTableBody.insertRow(-1);
        //insert cells into new row
        var cellLocation = newRow.insertCell(-1);
        var cellAvail = newRow.insertCell(-1);
        var cellOnOrder = newRow.insertCell(-1);
        var cellInProd = newRow.insertCell(-1);
        var cellBackOrder = newRow.insertCell(-1);
        //insert data into new cells
        console.log(obj.location);
        console.log(obj.quanonhand);
        console.log(obj.quanonorder);
        console.log(obj.quanbackorder);
        cellLocation.innerHTML = obj.location;
        cellAvail.innerHTML = obj.quanonhand;
        cellOnOrder.innerHTML = obj.quanonorder;
        cellBackOrder.innerHTML = obj.quanbackorder;
    }
}
function EmptyInfoFields() {
    iTableBody.innerHTML = ''; //empty info table body
    //pending functionality
}