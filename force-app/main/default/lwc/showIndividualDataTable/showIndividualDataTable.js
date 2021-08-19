
/**
* ─────────────────────────────────────────────────────────────────────────────────────────────────┐
* Component:  showIndividiualDataTable.js
* Description: Javascript Controller that interacts with Apex class, fetches data, hnadles and perform different events.
* ──────────────────────────────────────────────────────────────────────────────────────────────────
* @Developer Manpreet Singh 
* @created    2021-05-20
* ─────────────────────────────────────────────────────────────────────────────────────────────────
/**
*************************************************************************************************************************/


import { LightningElement, wire,track} from 'lwc';
import fetchIndividuals from '@salesforce/apex/IndividualDataController.fetchIndividuals';
import findVacCenter from '@salesforce/apex/IndividualDataController.findvacinationCenter';
import sendEmail from '@salesforce/apex/IndividualDataController.sendEmailNotification';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const actions = [
{ label: 'View', name: 'view' },
{ label: 'Edit', name: 'edit' },
{ label: 'Find Vaccination Center', name: 'findvaccinationcenter' },
{ label: 'Send Notification', name: 'SendNotification' },

];

const columns = [   
{ label: 'Name', fieldName: 'Name' ,type: "text", sortable: true},
{ label: 'Age', fieldName: 'Age__c' ,type: "text", sortable: true},
{ label: 'Is Notification Sent', fieldName: 'Is_Notification_Sent__c',type: "boolean", sortable: true },
{ label: 'Email', fieldName: 'Email__c' , type: "text",sortable: true},
{ label: 'Latitude', fieldName: 'Geo__Latitude__s' ,type: "number", sortable: true},
{ label: 'Nearest Vaccination Center', fieldName: 'Nearest_Vaccination_Center__c' ,type: "text", sortable: true},
{
type: 'action',
typeAttributes: { rowActions: actions },
},
];

export default class showIndividualDataTable extends NavigationMixin( LightningElement ) {

individuals;
error;
columns = columns;
rowId;
message;
notification;

/** Wired Apex result so it can be refreshed programmatically */
wiredIndividualssResult;
/**

*  @description      : get Individual object data
*  @name             : fetchIndividuals
*  @throws exception : NONE
**/

@wire( fetchIndividuals )  
wiredIndividuals( result  ) {
this.wiredIndividualssResult = result;
if ( result.data ) {
this.individuals = result.data;
this.error = undefined;
} else if ( result.error ) {
this.error = result.error;
this.individuals = undefined;
}
}

/**

*  @description      : handling Find Vaccine Center RowAction
*  @name             : findVaccinationCenter
*  @param            : event
*  @throws exception : NONE
**/
findVaccinationCenter(event){
this.rowId = event.Id;  
findVacCenter({recordId: this.rowId})
.then(result => {
this.message = 'Nearest Vaccination Center is- '+ ''+result;
this.showToast();
return refreshApex(this.wiredIndividualssResult);
})
.catch(error => {
this.error = error;
console.log(error);
});      
}

/**

*  @description      : handling sendNotification RowActions
*  @name             : sendEmailNotification
*  @param            : event
*  @throws exception : NONE
**/
sendEmailNotification(event){
this.rowId = event.Id;  
sendEmail({recordId: this.rowId})
.then(result => {
this.notification = result;
this.message = 'Email Notification has been sent Sucessfully!';
console.log('@@@@@message', this.notification );
this.showToast();
return refreshApex(this.wiredIndividualssResult);
})
.catch(error => {
this.error = error;
console.log(error);
});      
}


/**

*  @description      : get UI Theme 
*  @name             : getUIThemeDescriptionName
*  @param            : String
*  @throws exception : NONE
**/
handleRowAction( event ) {
const actionName = event.detail.action.name;
const row = event.detail.row;
switch ( actionName ) {
case 'view':
this[NavigationMixin.Navigate]({
type: 'standard__recordPage',
attributes: {
    recordId: row.Id,
    actionName: 'view'
}
});
break;
case 'edit':
this[NavigationMixin.Navigate]({
type: 'standard__recordPage',
attributes: {
    recordId: row.Id,
    objectApiName: 'Individual__c',
    actionName: 'edit'
}
});
break;
case 'findvaccinationcenter':
console.log('calling findVaccinationCenter');
this.findVaccinationCenter(row);
break;
case 'SendNotification' :
this.sendEmailNotification(row);
console.log('caling sendEmailNotification');

default:
}
}
/**

*  @description      : get UI Theme 
*  @name             : getUIThemeDescriptionName
*  @param            : String
*  @throws exception : NONE
**/
showToast() {
const event = new ShowToastEvent({
message: this.message,
variant: 'success',
mode: 'dismissable'
});
this.dispatchEvent(event);
}
}