global class IndividualDataBatch implements Database.Batchable<sObject> {
    public static String body;
    global Database.QueryLocator start(Database.BatchableContext BC) {
        // collect the batches of records or objects to be passed to execute
        List<StaticResource> staticResourceList =  new  List<StaticResource>();
        staticResourceList = [Select id, name, body from StaticResource  where name = 'people'];
         body = staticResourceList[0].body.toString();
        return Database.getQueryLocator(body);
    }
    
    global void execute(Database.BatchableContext BC, List<Individual__c> individualList) {
        List<Object> objList = (List<Object>)  JSON.deserializeUntyped(body);
        for(object obj : objList){
            Individual__c indiObj = new Individual__c	();
            Map<String,Object> data = (Map<String,Object>)obj;
            indiObj.Age__c = (Decimal)data.get('Age');
            indiObj.Name = (string)data.get('Name');
            indiObj.Geo__Latitude__s =Double.valueOf(data.get('Latitude'));
            indiObj.Geo__Longitude__s =Double.valueOf(data.get('Longitude'));
            individualList.add(indiObj);   
        }
        
        
        try {
            // Insert  the Individual Record
            insert individualList;
            
        } catch(Exception ex) {
            System.debug('There is an Exception while insering record' + ex.getMessage());
        }
        
    }   
    
    global void finish(Database.BatchableContext BC) {
        // execute any post-processing operations like sending email
    }
}