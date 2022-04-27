import { Notification } from "../models/notification-model";


let notifications : Notification [] = [
    {
        type : 'promo',
        title : 'New Offer',
        message : 'this is a reminder of an offer of 20% off'
    },
    {
        type : 'reminder',
        title : 'new reminder',
        message : 'this is a reminder message'
    }

]


export { notifications }