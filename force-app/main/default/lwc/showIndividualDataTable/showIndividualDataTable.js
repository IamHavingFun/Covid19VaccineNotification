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
{ label: 'Notification Sent', fieldName: 'Is_Notification_Sent__c',type: "boolean", sortable: true },
{ label: 'Email', fieldName: 'Email__c' , type: "email",sortable: true},
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
variant;
vaccniationcenter;
/** Wired Apex result so it can be refreshed programmatically */
wiredIndividualssResult;
/**

*  @description      : get Individual object data
*  @name             : fetchIndividuals
*  @throwsexception : NONE
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
*  @throwsexception : NONE
**/
findVaccinationCenter(event){
this.rowId = event.Id;  
findVacCenter({recordId: this.rowId})
.then(result => {
    if(result){
        this.vaccniationcenter = result;
        this.message = 'Nearest Vaccination Center is- '+ ''+result;
        this.variant = 'success';
        this.showToast();
        return refreshApex(this.wiredIndividualssResult);
    }
    else{
        this.variant = 'error';
        this.message = 'There is a problem whiile Finding Vaccination Center. Please check with your administrator';
        this.showToast(); 
    }

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
*  @throwsexception : NONE
**/
sendEmailNotification(event){
this.rowId = event.Id;  
sendEmail({recordId: this.rowId})
.then(result => {
this.notification = result;
if(result){
this.message = 'Email Notification has been sent Sucessfully!';
this.variant = 'success';
this.showToast();
return refreshApex(this.wiredIndividualssResult);
}
else if(this.vaccniationcenter==null){
    this.variant = 'error';
    this.message = 'There is a problem whiile Sending Email. Please click on Find Nearest Vaccination Center button';
    this.showToast();
}
else{
this.variant = 'error';
this.message = 'There is a problem whiile Sending Email. Please check with your administrator';
this.showToast();
}
})
.catch(error => {
this.error = error;
console.log(error);
});      
}


/**

*  @description      : Method to handle Row Actions.
*  @name             : handleRowAction
*  @param            : event
*  @throwsexception : NONE
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
this.findVaccinationCenter(row);
break;
case 'SendNotification' :
this.sendEmailNotification(row);
default:
}
}
/**

*  @description      : Show Toast Message for error or success! 
*  @name             : showToast
*  @param            : String
*  @throwsexception : NONE
**/
showToast() {
const event = new ShowToastEvent({
message: this.message,
variant: this.variant,
mode: 'dismissable'
});
this.dispatchEvent(event);
}
}