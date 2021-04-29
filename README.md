# NetSuite Custom UI SuiteScript

This was an early project I did for Hallmark Floors with NetSuite in 2016.
It creates a custom form interface where items can be searched and basic information would be loaded into tables. It was used to bridge the gap between operational workflows we experienced when switching to NetSuite for the first time.

## How does it work?

It creates a menu item on NetSuite's interface which leads into the UI.

The UI contains a text field which is then populated with an HTML form which loads scripts.

The form has a dropdown which is linked to NetSuite's item API and gets a list of products.
When a product is selected, tables are programmatically formed with a summary of information, such as inventory quantity, quantity allocated to pending orders, quantity on pending purchase orders, etc.

Employees are able to enter new allocations and request quantity directly from the UI which will programmatically create new sales orders, add entries to existing sales orders, create purchase orders, or add entries to existing purchase orders, whichever action is appropriate.