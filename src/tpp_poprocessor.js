/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/transaction', 'N/cache'],
/**
 * @param {record} record
 * @param {search} search
 * @param {transaction} transaction
 * @param {cache} cache
 */
function(record, search, transaction, cache) {
    // internal id for PO
    var poId = 48063;
    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {

    }

    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {
        //TODO: data validation
        var data = JSON.stringify(requestBody);
        log.debug({
            title: 'Data received from POST',
            details: JSON.stringify(requestBody),
        });
        log.debug({
            title: 'Data received as an object',
            details: requestBody,
        });
        // load PO and process data into new entries into PO
        var purchaseOrder = loadPo(poId);
        addPoEntry(purchaseOrder, requestBody);
        /* Auxiliary functions */
        function addPoEntry(record, dataArray) {
            // for each piece of data in the data array, add new data line to purchase order
            dataArray.forEach(function(obj) {
                if (obj.lineid === "") {
                    try {
                        var lineCount = record.getLineCount({ sublistId: 'item' });
                        record.insertLine({
                            sublistId: 'item',
                            line: lineCount,
                        });
                        log.debug({
                            title: "Step 1 Po Entry succeeded!",
                            details: "Line inserted, num of lines: " + lineCount,
                        });
                        /* Set line fields here */
                        // item
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: lineCount,
                            value: obj.item,
                        });
                        log.debug({
                            title: "Item field set",
                            details: "value set: " + obj.item.toString(),
                        })
                        // factory
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_prodorder_vendor',
                            line: lineCount,
                            value: obj.factory,
                        });
                        log.debug({
                            title: "factory field set",
                            details: "value set: " + obj.factory.toString(),
                        });
                        // ship date
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol10',
                            line: lineCount,
                            value: new Date(obj.date),
                        });
                        log.debug({
                            title: "date field set",
                            details: "value set: " + obj.date.toString(),
                        })
                        // quantity
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: lineCount,
                            value: obj.quantity,
                        });
                        log.debug({
                            title: "quantity field set",
                            details: "value set: " + obj.quantity.toString(),
                        });
                        // set destination warehouse
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            line: lineCount,
                            value: 106,
                        });
                    }
                    catch (err) {
                        log.debug({
                            title: "Error inserting lines into record: " + err.name,
                            details: "Details: " + err.message,
                        });
                    }
                }
                else {
                    // process with lineid in consideration
                    try {
                        // set factory
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_prodorder_vendor',
                            line: parseInt(obj.lineid) - 1,
                            value: obj.factory,
                        });
                        // set date
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol10',
                            line: parseInt(obj.lineid) - 1,
                            value: new Date(obj.date),
                        });
                        // set quantity
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: parseInt(obj.lineid) - 1,
                            value: obj.quantity,
                        });
                    }
                    catch (e) {
                        log.debug({
                            title: "Error setting values on existing line in record: " + e.name,
                            details: "Details: " + e.message,
                        });
                    }
                }
            });
            /* Save changes to record after all lines have been inserted */
            record.save();
            log.debug({
                title: "Record saved!",
                details: "",
            });
        }

        // response after all POST operations are done
        var response = {
            title: "data received!",
            details: "blahblahblah"
        };
        return JSON.stringify(response);    
    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {
        // validate requestparams
        log.debug({
            title: "Request Parameters received",
            details: JSON.stringify(requestParams),
        });
        var response = "";
        // DELETE http method called
        //load PO
        var purchaseOrder = loadPo(poId);
        try {
            log.debug({
                title: "Attempting to remove line",
                details: "Removing at: " + requestParams.lineid,
            })
            purchaseOrder.removeLine({
                sublistId: 'item',
                line: parseInt(requestParams.lineid) - 1,
            });
            purchaseOrder.save();
            /**
             * Bug discovered, line id doesn't change according to what is being deleted
             */
            response = "Line removed successfully!";
        }
        catch (err) {
            log.debug({
                title: "Error removing lines from record: " + err.name,
                details: "Details: " + err.message,
            });
            response = err.name + ": " + err.message;
        }
        
        return response;
    }

    /**
     * Function called to load a transaction based on internalId
     * 
     * @param {string | int} internalId - Internal ID of the transaction in question,
     * @returns {Record | Object} returns a record object based on Record.record in NetSuite's API
     */
    function loadPo(internalId) {
        try {
            var thisRecord = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: internalId,
                isDynamic: false,
            });
            log.debug({
                title: "record loaded: " + thisRecord.id,
                details: "record type: " + thisRecord.type,
            });
        }
        catch (err) {
            log.debug({
                title: "record was unable to be loaded: " + err.name,
                details: err.message
            });
        }

        return thisRecord;
    }

    return {
        'get': doGet,
//        put: doPut,
        post: doPost,
        'delete': doDelete
    };
    
});
