// Used to load data from NetSuite into table

var cTableUrl = "/app/site/hosting/restlet.nl?script=scriptNum&deploy=1";
var itemField = document.getElementById("custpage_input_itemfield_display");
// var hidden_itemField = document.getElementById("hddn_custpage_input_itemfield_fs");
var cTableBody = document.getElementById("currentTbody");
var startButton = document.getElementById("startButton");

itemField.addEventListener("change", function(){
    startButton.removeAttribute("disabled");
    console.log("Value of itemField: " + itemField.value);
});
startButton.addEventListener("click", GetTableRESTlet);


function GetTableRESTlet() {
    var appendedURL = cTableUrl + "&itemid=" + hidden_itemField.value;
    console.log("ItemId: " + itemField.value);
    console.log("Item hidden internal ID: " + hidden_itemField.value);
    /* XHR begin here */
    var request = new XMLHttpRequest();
    request.open('GET', appendedURL, true);
    // Set headers
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Accept", "*/*");
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // request succeeded
            var data = JSON.parse(request.responseText);
            console.log("Data Received!<--Current Table-->");
            console.log("Data: " + JSON.stringify(data));
            // append 'current' table with data
            try {
                // first delete all data from pending and current tables
                EmptyFields();
                // finally append data to table
                AppendCurrentTable(data);
            }
            catch (err) {
                console.log("Error occured while appending to current table");
                console.log("Error: " + err.message);
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
    /* XHR end here */
}

function EmptyFields() {
    var pendingTbody = document.getElementById("pendingTbody");
    pendingTbody.innerHTML = ""; // empty contents
    cTableBody.innerHTML = ""; // empty contents of table body
    postDataArray = {}; // empty contents of the pending data array
    keyCounter = 0;
    console.log("contents of tables emptied and post data array have been wiped");
}

function AppendCurrentTable(objArray) {
    for (let obj of objArray) {
        // insert row at the end of table body
        var newRow = cTableBody.insertRow(-1);
        // insert cells
        var cellShipDate = newRow.insertCell(-1);
        var cellVendor = newRow.insertCell(-1);
        var cellQuantity = newRow.insertCell(-1);
        var editB = newRow.insertCell(-1);
        var deleteB = newRow.insertCell(-1);
        var lineId = newRow.insertCell(-1);
        // insert data from obj
        // console.log(obj.shipdate);
        // console.log(obj.vendor);
        // console.log(obj.quantity);
        cellShipDate.innerHTML = obj.shipdate;
        cellVendor.innerHTML = obj.vendor;
        cellQuantity.innerHTML = obj.quantity;
        lineId.innerHTML = obj.lineid;

        // setting a variable
        // edit and delete buttons
        var editButton = document.createElement("button");
        editButton.setAttribute("type", "button");
        editButton.setAttribute("class", "btn btn-secondary btn-sm");
        editButton.appendChild(document.createTextNode("Edit"));
        editButton.addEventListener("click", EditButtonClickCurrent);
    
        var deleteButton = document.createElement("button");
        deleteButton.setAttribute("type", "button");
        deleteButton.setAttribute("class", "btn btn-secondary btn-sm");
        deleteButton.appendChild(document.createTextNode("Delete"));
        deleteButton.addEventListener("click", DeleteButtonClickCurrent);
        
        // append buttons to field
        editB.appendChild(editButton);
        deleteB.appendChild(deleteButton);
    }
}

function DeleteButtonClickCurrent(event) {
    console.log("Delete button clicked!");
    // send a delete request to the RESTlet with lineid information.
    var td = event.target.parentNode;
    var tr = td.parentNode;
    var lineid = tr.children[5].innerHTML;
    console.log("Line Id captured: " + lineid);
    DeleteRequest(lineid);
}
function DeleteRequest(lineid) {
    console.log("Delete request function entered, attempting to send AJAX request");
    // form appended url with lineid as parameter
    var appendedURL = poProcUrl + "&lineid=" + lineid; // do validation against this
    // send an ajax request with delete as the http method
    var request = new XMLHttpRequest();
    request.open('DELETE', appendedURL);
    request.setRequestHeader("Content-Type", "text/plain");
    request.onload = function() {
        // when request finishes and a response is sent back
        if (request.status >= 200 && request.status < 400) {
            // process response
            console.log(request.response);
            // redraw current table
            GetTableRESTlet();
            // redraw info table
            GetInfoRESTlet();
        }
        else {
            // request failed
            console.log("******");
            console.log("Request failed with code" + request.status + ", message below:");
            console.log(request.statusText);
            console.log("******");
        }
    }
    request.onerror = function() {
        // handle errors if they happen
        console.log("There was an error attempting to reach the server.");
    }   
    request.send();
}

function EditButtonClickCurrent(event) {
    console.log("Edit button clicked!");
    // edit button reference
    var button = event.target;
    // button.setAttribute("disabled", ""); // disables the button
    /*
    send the row's contents to data array, then to the pending table, and mark the row with
    color to signify that this is an existing line being edited.
    */
    // push data back into form
    PopulateForm(button);
    // mark current table row with a different color
    
    // mark pending table row with the same different color???
    
}
/**
 * 
 * @param {*} event pass in the event from button click
 */
function PopulateForm(button) {
    console.log("***** Populate Form begin here *****"); // start log
    var td = button.parentNode;
    var tr = td.parentNode;
    console.log("* Target table row captured");

    document.getElementById("shippingDateInput").value = FormatYMDDate(tr.children[0].innerHTML);
    console.log("* date input form control populated");
    document.getElementById("factoryInput").value = tr.children[1].innerHTML;
    console.log("* factory text input form control populated");
    document.getElementById("quantityInput").value = tr.children[2].innerHTML;
    console.log("* quantity numeric input form control populated");
    document.getElementById("lineidtext").value = tr.children[5].innerHTML;
    console.log("* line id text input form control populated");
    console.log("* Populate Form finished");
    console.log("***** Populate Form end here *****"); // end
}
/**
 * Builds a data block from a line in current table
 */
function BuildDataEdit(event) {
    console.log("*****"); //start log
    console.log("Building update to existing data block...");

    var data = {};
    try {
        var td = event.target.parentNode;
        var tr = td.parentNode; 
        
        data.item = hidden_itemField.value;
        data.shippingdate = tr.children[0].innerHTML;
        data.factoryinfo = tr.children[1].innerHTML;
        data.quantity = tr.children[2].innerHTML;
        data.lineid = tr.children[5].innerHTML;

        console.log("Data Built! data block:");
        console.log(JSON.stringify(data));
    }
    catch(e) {
        console.log("Error occured, data block unable to be built")
        console.log(e);
    }

    console.log("*****"); //end log
    return data;
}
