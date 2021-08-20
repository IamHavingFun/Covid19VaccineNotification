/**
* ─────────────────────────────────────────────────────────────────────────────────────────────────┐
* Class Name:  IndividualDataController
* Description: Controller class populating individual data to datatable,finding nearest vaccination center and Sending Email Notification
* ──────────────────────────────────────────────────────────────────────────────────────────────────
* @Developer Manpreet Singh
* @created    2021-05-20
* ─────────────────────────────────────────────────────────────────────────────────────────────────
/**
*************************************************************************************************************************/
public with sharing class IndividualDataController {

/**
*  @description      : populate Individual Data 
*  @name             : fetchIndividuals
*  @param            : String
*  @throws exception : NONE
**/

@AuraEnabled( cacheable = true )
public static List< Individual__c > fetchIndividuals() {
return [ SELECT Id, Name, Age__c, Email__c,Geo__Latitude__s,Is_Notification_Sent__c,Nearest_Vaccination_Center__c  FROM Individual__c ORDER BY Age__c DESC]; 
}

/**

*  @description      : Send Email Notification
*  @name             : sendEmailNotification
*  @param            : String
*  @throws exception : NONE
**/

@AuraEnabled
public static boolean sendEmailNotification(String recordId) {
Boolean notification = false;
Individual__c  indObj= [ SELECT Id,Is_Notification_Sent__c,Email__c  FROM Individual__c where id=:recordId];        
if(indObj!=Null && indObj.Email__c !=Null){
indObj.Is_Notification_Sent__c= true;
notification=true;     
}
else{
    notification=false;    
}
try{
update indObj;
}
catch (Exception ex){
System.debug('There is an exception while updating field Is Notification sent' + ex.getMessage());
}
return notification;
}

/**

*  @description      : get Nearest Vaccination Center
*  @name             : findvacinationCenter
*  @param            : String
*  @throws exception : NONE
**/

@AuraEnabled
public static String findvacinationCenter(String recordId) {
Individual__c  indObj = [SELECT Id, Name, Age__c, Email__c,Geo__Latitude__s,Geo__Longitude__s,Nearest_Vaccination_Center__c
FROM Individual__c where id=:recordId];
String nearersVacCenter = '';
Decimal indiLatitide = indObj.Geo__Latitude__s;
Decimal indiLongitude = indObj.Geo__Longitude__s;       
List<Vaccination_Center__c> vacList = [SELECT id,Name,Geo__c,Geo__Latitude__s,Geo__Longitude__s from Vaccination_Center__c where 
                        DISTANCE(Geo__c, GEOLOCATION( :indiLatitide, :indiLongitude), 'mi') > 20
                            ORDER BY DISTANCE(Geo__c, GEOLOCATION( :indiLatitide, :indiLongitude ) , 'mi') ASC];
if(vacList.size()>0){
nearersVacCenter = vacList[0].Name;
indObj.Nearest_Vaccination_Center__c = nearersVacCenter;
try{
    update indObj;
}
catch (Exception ex){
    System.debug('There is an exception while updating neareast vaccination center field on Individual object' + ex.getMessage());
    }
}
else{
nearersVacCenter = 'vacList[0].Name';
System.debug('No neasrest vac center found ' + nearersVacCenter) ;
}
return nearersVacCenter;
}

}