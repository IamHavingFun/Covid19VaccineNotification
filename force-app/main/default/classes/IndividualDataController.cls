public with sharing class IndividualDataController {
    public IndividualDataController() {

    }
    @AuraEnabled( cacheable = true )
    public static List< Individual__c > fetchIndividuals() {
     
        return [ SELECT Id, Name, Age__c, Email__c,Geo__Latitude__s,Is_Notification_Sent__c,Nearest_Vaccination_Center__c  FROM Individual__c ORDER BY Age__c DESC];
         
    }

    @AuraEnabled
    public static boolean sendEmailNotification(String recordId) {
        
        Boolean notification = false;
        Individual__c  indObj= [ SELECT Id,Is_Notification_Sent__c   FROM Individual__c where id=:recordId];        
        if(indObj!=Null){
            indObj.Is_Notification_Sent__c= true;
            notification=true;     
        } 
        try{
          update indObj;
      }
      catch (Exception ex){
        System.debug('There is an exception' + ex.getMessage());
      }
      return notification;
    }

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
                                     System.debug('vacList ' + vacList.size());
        if(vacList.size()>0){
            nearersVacCenter = vacList[0].Name;
            indObj.Nearest_Vaccination_Center__c = nearersVacCenter;
            try{
                update indObj;
            }
            catch (Exception e){
                System.debug('There is an exception' + e.getMessage());
              }
        }
        else{
            nearersVacCenter = 'vacList[0].Name';
            System.debug('No neasrest vac center found ' + nearersVacCenter) ;
        }
        return nearersVacCenter;
    }

}