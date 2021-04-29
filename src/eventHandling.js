var postDataArray = {};
var keyCounter = 0;
var pendingTBody = document.getElementById("pendingTbody");

// Used to load data from NetSuite into info panel
// var infoUrl = "/app/site/hosting/restlet.nl?script=scriptNum&deploy=1";
// var itemField = document.getElementById("custpage_input_itemfield_display");
// var debugText = document.getElementById("debugText");
// var addButton = document.getElementById("addButton").addEventListener("click", GetInfoRESTlet);

// Used to load data from NetSuite into table
// var cTableUrl = "/app/site/hosting/restlet.nl?script=scriptNum&deploy=1";
var hidden_itemField = document.getElementById("hddn_custpage_input_itemfield_fs");
// var cTableBody = document.getElementById("currentTbody");
// var startButton = document.getElementById("startButton");

var poProcUrl = "/app/site/hosting/restlet.nl?script=scriptNum&deploy=1";
// remove disabled tag off of submit button for now
document.getElementById("submitButton").removeAttribute("disabled");

document.getElementById("addButton").addEventListener("click", BuildData);
document.getElementById("submitButton").addEventListener("click", function() { PostRestlet(postDataArray); });

function BuildData() {
    console.log("button clicked! Building data now...");

    var data = {};
    // build data object
    try {
        data.item = hidden_itemField.value;
        data.date = FormatShortDate(document.getElementById("shippingDateInput").value);
        data.factory = document.getElementById("factoryInput").value;
        data.quantity = document.getElementById("quantityInput").value;
        // handle optional parameter/argument here
        if (document.getElementById("lineidtext").value !== "") {
            data.lineid = document.getElementById("lineidtext").value;
        }
        else {
            data.lineid = "";
        }
        console.log("Data built! data: " + JSON.stringify(data));
    }
    catch(err) {
    	console.log(err.message);
    }
    // append data object contents to table on page
    try {
        AppendTableGeneral(data);
        console.log("data appended to table!");
    }
    catch (err) {
        console.log(err.message);
    }
    // save data object to array for processing later
    try {
        var key = 'a' + keyCounter.toString();
        postDataArray[key] = data;
        console.log("data saved to array, ready to take in new data");
        console.log("array length: " + Object.keys(postDataArray).length);
        // then remove contents from entry form fields
        document.getElementById("shippingDateInput").value = "";
        document.getElementById("factoryInput").value = "";
        document.getElementById("quantityInput").value = "";
        document.getElementById("lineidtext").value = "";
    }
    catch (err) {
        console.log(err.message);
    }
    keyCounter++;
    // DEBUG: output data array to console for testing
    // try {
    //     Object.values(postDataArray).forEach(function(item) {
    //         console.log(JSON.stringify(item));
    //     });
    //     console.log("Entire Data Array: ");
    //     console.log(JSON.stringify(postDataArray));
    //     keyCounter++;
    // }
    // catch (err) {
    //     console.log(err.message);
    // }
}

function AppendTableGeneral(data) {
    console.log("*****");
    console.log("Appending data to table...");
    var newRow = pendingTBody.insertRow(-1);
    var shippingDate = newRow.insertCell(-1);
    var factoryId = newRow.insertCell(-1);
    var quantity = newRow.insertCell(-1);
    var editB = newRow.insertCell(-1);
    var deleteB = newRow.insertCell(-1);
    var lineidCell = newRow.insertCell(-1);
    var hiddenArrayIndex = newRow.insertCell(-1);
    console.log("row and cells inserted...");
    shippingDate.innerHTML = data.date;
    factoryId.innerHTML = data.factory;
    quantity.innerHTML = data.quantity;
    console.log("data inserted into table!");
    // create buttons and add event listeners
    var editButton = document.createElement("button");
    editButton.setAttribute("type", "button");
    editButton.setAttribute("class", "btn btn-secondary btn-sm");
    editButton.appendChild(document.createTextNode("Edit"));
    editButton.addEventListener("click", EditButtonClickPending);

    var deleteButton = document.createElement("button");
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("class", "btn btn-secondary btn-sm");
    deleteButton.appendChild(document.createTextNode("Delete"));
    deleteButton.addEventListener("click", DeleteButtonClickPending);

    editB.appendChild(editButton);
    deleteB.appendChild(deleteButton);
    console.log("Edit and Delete buttons created and inserted into table!");
    // lineid if it exists
    if (data.lineid !== "") {
        lineidCell.innerHTML = data.lineid;
    }
    // hide the array index column and record the current index
    hiddenArrayIndex.setAttribute("class", "hiddenTBody");
    hiddenArrayIndex.innerHTML = 'a' + keyCounter;
    console.log("array index: data inserted and cell hidden!");
    // DEBUG
    console.log("index in post data array:" + hiddenArrayIndex.innerHTML);
    console.log("*****");
}

function PostRestlet(dataArray) {
    console.log("Post function entered. Attempting to build and send request...");
    /* Apply overlay to prevent any thing from happening while request is processing */
    
    /* XHR begin */
    var request = new XMLHttpRequest();
    request.open('POST', poProcUrl, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
        // when request finishes loading
        if (request.status >= 200 && request.status < 400) {
            // TODO: handle the response
            try {
                console.log("Response received! Attempting to parse response...");
                var response = JSON.stringify(request.response);
                console.log(response.title);
                console.log(response.details);
            }
            catch (err) {
                console.log("Error: " + err.message);
            }
            // after posting, rebuild tables
            try {
                GetTableRESTlet();
                GetInfoRESTlet();
            }
            catch (err) {
                console.log("Error: " + err.message);
            }
        }
        else {
            // request reached server but returned an error
            console.log("Request error: " + request.status);
            console.log(request.statusText);
        }
    }
    request.onerror = function() {
        console.log("There was an error trying to reach the server");
    }
    // process the data array into a json string that can be sent with the request
    var data = JSON.stringify(Object.values(dataArray));
    console.log(data);
    request.send(data);
    /* XHR end */
}

/* Date Formating functions */
function FormatShortDate(dateInput) {
    var d = new Date(dateInput);
    return [d.getMonth() + 1, d.getDate() + 1, d.getFullYear()].join('/');
}
function FormatYMDDate(dateInput) {
    var d = new Date(dateInput);
    return [d.getFullYear(), d.getMonth() + 1, d.getDate() + 1].join('-');  
}

/* Button pressing functions */
function DeleteButtonClickPending(event) {
    console.log("Table: Row: delete button clicked!");
    var td = event.target.parentNode;
    var tr = td.parentNode;
    // remove from post data array
    try {
        var key = tr.children[tr.children.length - 1].innerHTML;
        //DEBUG
        console.log("Index parsed for post data array removal: " + key);
        delete postDataArray[key];
    }
    catch (err) {
        console.log("Error: " + err.message);
    }
    // remove from table
    tr.parentNode.removeChild(tr);
}
function EditButtonClickPending(event) {
    console.log("Table: Row: edit button clicked!");
    // populate form fields with data from removed row
    var td = event.target.parentNode;
    var tr = td.parentNode;
    try {
        document.getElementById("shippingDateInput").value = FormatYMDDate(tr.children[0].innerHTML); // first cell of row: shipping date
        document.getElementById("factoryInput").value = tr.children[1].innerHTML; // second cell of row: factory/invoice id/code
        document.getElementById("quantityInput").value = tr.children[2].innerHTML; // third cell of row: quantity
        // remove from table and data array
        DeleteButtonClickPending(event); // re-use deletion function for removing the data
    }
    catch (err) {
        console.log("Error: " + err.message);
    }
}