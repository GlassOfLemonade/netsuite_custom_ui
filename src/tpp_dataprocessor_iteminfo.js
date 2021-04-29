/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/search'],
/**
 * @param {https} https
 * @param {search} search
 */
function(https, search) {
   
    var savedSearchId = 'savedSearchId';
    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {
        try {
            // return data from saved search
            log.debug({
        		title: "Request parameters received",
        		details: JSON.stringify(requestParams),
        	});
            var data = RunSearch(requestParams);
            return data;
        }   
        catch (err) {
            log.debug({
                title: err.name,
                details: err.message,
            })
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

    function RunSearch(reqParams) {
        var savedSearch = search.load({ id: savedSearchId });

        if (reqParams != '') {
            var itemFilter = search.createFilter({ name: "internalid", operator: search.Operator.IS, values: reqParams.itemid });
            savedSearch.filters.push(itemFilter);
        }

        var resultSet = savedSearch.run();
        var objArray = [];
        try {
            resultSet.each(function(result) {
                // build data object
                var obj = {};
                obj.internalid = result.getValue(resultSet.columns[0]);
                obj.name = result.getValue(resultSet.columns[1]);
                obj.locationid = result.getValue(resultSet.columns[2]);
                obj.location = result.getValue(resultSet.columns[3]);
                obj.quanonhand = result.getValue(resultSet.columns[4]);
                obj.quanonorder = result.getValue(resultSet.columns[5]);
                obj.quanbackorder = result.getValue(resultSet.columns[6]);
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
        return objArray;
    }

    return {
        'get': doGet,
//        put: doPut,
        post: doPost,
//        'delete': doDelete
    };
    
});
