/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/record', 'N/search', 'N/log', 'N/ui/dialog', 'N/ui/serverWidget', 'N/https'],
/**
 * @param {file} file
 * @param {record} record
 * @param {search} search
 * @param {log} log
 * @param {dialog} dialog
 * @param {serverWidget} serverWidget
 * @param {https} https
 */
function(file, record, search, log, dialog, serverWidget, https) {
   
	var htmlFormId = 'formIdHere';
	
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	var eventRouter = {};
    	eventRouter[https.Method.GET] = HandleGet;
    	eventRouter[https.Method.POST] = HandlePost;
    	
    	eventRouter[context.request.method] ? eventRouter[context.request.method](context) : HandleError(context);
    }
    
    /**
     * 
     */
    function HandleGet(context) {
    	/* build UI */
    	var form = BuildUi(context);
    	/* JSON payload from RESTlet for search information */
    	/* ajax for various filters on above payload */
    	/* URI discovery for RESTlet */
    	/* build JS objects from inline HTML */
    	context.response.writePage({
    		pageObject: form,
    	})
    }
    
    /**
     * 
     */
    function HandlePost(context) {
    	/* send JS objects as payload to processing RESTlet */
    	/* URI discovery for RESTlet */
    	/* consume response from RESTlet - errors, completion messages, etc. */
    }
    
    /**
     * 
     */
    function HandleError(context) {
    	
    }
    
    /**
     * 
     */
    function BuildUi(context) {
    	var form = serverWidget.createForm({ title: 'TPP Main Menu' });
    	
//    	form.addSubmitButton({ label: 'Submit' });
    	var fieldGroup = form.addFieldGroup({
    		id: "custpage_fieldgroup_main",
    		label: "Item",
    	});
    	fieldGroup.isSingleColumn = true;
    	
    	var itemField = form.addField({
    		id: 'custpage_input_itemfield',
    		label: 'Item',
    		type: serverWidget.FieldType.SELECT,
			source: 'item',
			container: "custpage_fieldgroup_main"
    	});
    	var bodyField = form.addField({
    		id: 'custpage_infofield',
    		label: 'Information Field',
			type: serverWidget.FieldType.INLINEHTML,
			container: "custpage_fieldgroup_main"
    	});
    	
    	bodyField.defaultValue = file.load({ id: htmlFormId }).getContents();
    	return form;
    }

    return {
        onRequest: onRequest
    };
    
});
