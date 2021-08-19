/**
* ─────────────────────────────────────────────────────────────────────────────────────────────────┐
* Class Name:  IndividualDataControllerTest
* Description: Test Class for IndividualDataController
* ──────────────────────────────────────────────────────────────────────────────────────────────────
* @Developer Manpreet Singh
* @created    2021-05-20
* ─────────────────────────────────────────────────────────────────────────────────────────────────
/**
*************************************************************************************************************************/
@isTest(SeeAllData=false)
public class IndividualDataControllerTest {

/**

*  @description      : test data Method 
*  @name             : testDatas
*  @throws exception : NONE
**/

@testSetup static void testData(){
List<Individual__c> individualList =  new List<Individual__c>();
List<Vaccination_Center__c> vaccineCenterList =  new List<Vaccination_Center__c>();
Individual__c indiObj = new Individual__c();
indiObj.Name = 'Manpreet';
indiObj.Age__c=28;
indiObj.Email__c = 'test.sfdc@test.com';
indiObj.Geo__Latitude__s = 53.810800826759106;
indiObj.Geo__Longitude__s = -6.513679434703355;
indiObj.Is_Notification_Sent__c =false;
indiObj.Nearest_Vaccination_Center__c = 'Citywest Convention Centre Dublin';
individualList.add(indiObj);
insert indiObj;

Vaccination_Center__c vaccineObj = new Vaccination_Center__c();
vaccineObj.Name = 'Citywest Convention Centre Dublin';
vaccineObj.Geo__Latitude__s = 53.28603418885669;
vaccineObj.Geo__Longitude__s = -6.4444477725802285;
vaccineCenterList.add(vaccineObj);
insert vaccineObj;
}

/**

*  @description      : test Method for fetchIndividuals Method 
*  @name             : fetchIntestFetchIndividualsdividuals
*  @throws exception : NONE
**/

static testMethod void testFetchIndividuals(){
list<Individual__c> individualList= IndividualDataController.fetchIndividuals();
System.assert(individualList.size()>0);
}

/**

*  @description      : test Method for SendEmailNotification Method 
*  @name             : testSendEmailNotification
*  @throws exception : NONE
**/
static testMethod void testSendEmailNotification(){
Individual__c indiObj = [Select id,Is_Notification_Sent__c, name from Individual__c where name='Manpreet' limit 1];
Boolean isNotificationSent = IndividualDataController.sendEmailNotification(indiObj.Id);
System.assertequals(isNotificationSent,true);
}

/**

*  @description      : test Method for FindVacinationCenter Method 
*  @name             : testFindVacinationCenter
*  @throws exception : NONE
**/
static testMethod void testFindVacinationCenter(){
Individual__c indiObj = [Select id,Is_Notification_Sent__c,Nearest_Vaccination_Center__c, name from Individual__c where name='Manpreet' limit 1];
String isNotificationSent = IndividualDataController.findvacinationCenter(indiObj.Id);
System.assertNotEquals(indiObj.Nearest_Vaccination_Center__c,null);
}
}