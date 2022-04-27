export type notificationPayload = {

    /*
    "medium" : ["whatsapp", "slack", "sms"],
    "schedule" : [1,1],
    "adhc" : false,
    "userId" : "9kjsdhf",
    "group" : ["*"]
    */

    medium : string [] ;
    schedule : string [];
    adhc : boolean;
    userId: string ;
    group: string[] ;
}