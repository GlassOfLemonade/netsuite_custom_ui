/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/search', 'N/log'],
/**
 * @param {https} https
 * @param {search} search
 */
function(https, search) {
    var production_searchId = 'savedSearchId';

    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {
        try {
        	log.debug({
        		title: "Request parameters received",
        		details: JSON.stringify(requestParams),
        	});
            var data = runSearch(requestParams);
            return data;
        }
        catch (err) {
            log.debug({
                title: err.name,
                details: err.message
            });
        }
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

    }

    function runSearch (reqParam) {
        var production_search = search.load({
            id: production_searchId,
        });
        
       if (reqParam != '') { // request parameter for item
           var filter_itemfield = search.createFilter({ name: "item", operator: search.Operator.IS, values: reqParam.itemid });
           production_search.filters.push(filter_itemfield);
       }

        var resultSet = production_search.run();
//        log.debug({
//            title: "Number of results returned",
//            details: resultSet.getRange({ start: 0, end: 9 }).length,
//        });
        // log.debug({
        //     title: "itemId column name",
        //     details: resultSet.columns[2].name,
        // });
        var objArray = [];
        try {
            resultSet.each(function(result) {
                // build data object
                var obj = {};
                obj.shipdate = result.getValue(resultSet.columns[0]);
                obj.item = result.getValue(resultSet.columns[1]);
                obj.itemid = result.getValue(resultSet.columns[2]);
                obj.tranid = result.getValue(resultSet.columns[3]);
                obj.internalid = result.getValue(resultSet.columns[4]);
                obj.vendor = result.getValue(resultSet.columns[5]);
                obj.quantity = result.getValue(resultSet.columns[6]);
                obj.lineid = result.getValue(resultSet.columns[7]);
                // push to array
                objArray.push(obj);
                return true;
            });
        }
        catch (err) {
            log.debug({
                title: 'Error with parsing result set: ' + err.name,
                details: err.message,
            });
        }
//        objArray.forEach(function(obj) {
//            var counter = 1;
//            log.debug({
//                title: "object " + counter + " in object array!",
//                details: "itemid in object: " + obj.item,
//            });
//            counter++;
//        });
        // return resultSet;
        return objArray;
    }

    return {
        'get': doGet,
//        put: doPut,
        post: doPost,
//        'delete': doDelete
    };
    
});
