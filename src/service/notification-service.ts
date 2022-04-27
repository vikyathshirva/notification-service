import { notifications } from "../store/notification-message";
import { User } from "../models/user";
import { users } from "../store/users";
import { notificationPayload } from "../models/payload";
import { notificationBody } from "../models/notification-response";
import { Notification } from "../models/notification-model";
import cron from "node-cron"
import Kafka from "node-rdkafka"
import { KafkaConsumer } from "node-rdkafka";
import { json } from "stream/consumers";
import { streams } from "avsc/types";
import { eventType } from "../models/eventType";
import { WatchEventType } from "fs";
import EventEmitter from "events";
import { cache } from "../models/cache";
import { count } from "console";
import { eventTypeByTopic } from "../models/eventByTopic";
import { whatsAppHandler } from "./third-party-intg/whatsapp-handler";


const eventEmitter = new EventEmitter;


/**
 * 
 * @param body 
 */
export const notificationFeeder = (body: notificationPayload) => {

    let mediums = body.medium;
    let schedule = body.schedule;
    let adhc = body.adhc;
    let userId = body.userId;
    let group = body.group;
    let offerNotification = notifications[0];
    let standardNotification = notifications[1];
    let notificationStream: notificationBody[] = [];
    if (adhc) {
        feederValidationFilter(userId, notificationStream, offerNotification, mediums, group);
    } else {
        scheduler(schedule, notificationStream, userId, offerNotification, mediums, group);
        console.log("set up cron jobs for scheduling");
    }

    rateLimiter();
};

/**
 * Can implement a cache layer to check for limiting, but will skip that part
 */
function rateLimiter() {
    let received: any[] = [];
    let limit = 1 ;
    console.log('rate limiter called');

    
    
    const consumer = new Kafka.KafkaConsumer({
        'group.id': 'kafka',
        'metadata.broker.list': 'localhost:9092'
    }, {});
    consumer.connect();
    consumer.on('ready', () => {
        console.log("consumer ready");
        consumer.subscribe(['test']);
        consumer.consume();
    }).on('data', (data) => {
        let testObj;
        if ((data !== undefined || null) && limit !== 0){
            testObj = JSON.parse(JSON.stringify(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')))).freq[0];
            (testObj === 'default' || parseInt(testObj) >= limit ) ? received.push(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data'))) : "";
        // console.log(`received  : ${eventType.fromBuffer(data.value)}`);
        }else if(limit == 0){
            received.push(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')));
        }
        console.log(`received:  ${eventType.fromBuffer(data?.value ?? Buffer.from('error handling inside here//'))}`);
        console.log("storage array",received);

        received.forEach(ele => {
            notificationHandler(ele);
        })
        
    })

    
    
}

/**
 *  Use this to transform data or removed fields
 * @param ele 
 */
function notificationHandler(ele : any){
    let transformationArray = [];
    transformationArray.push(ele);
    console.log("transform",transformationArray);
    whatsAppHandler();
    if( transformationArray.length > 0){
        const streamWhatsapp = Kafka.Producer.createWriteStream({
            'metadata.broker.list': 'localhost:9092'
        }, {}, { topic: 'whatsapp' });

        const streamSms = Kafka.Producer.createWriteStream({
            'metadata.broker.list': 'localhost:9092'
        }, {}, { topic: 'sms' });

        const streamSlack = Kafka.Producer.createWriteStream({
            'metadata.broker.list': 'localhost:9092'
        }, {}, { topic: 'slack' });

        const streamEmail = Kafka.Producer.createWriteStream({
            'metadata.broker.list': 'localhost:9092'
        }, {}, { topic: 'email' });

        let result;
        transformationArray.forEach(notification => {
            let obj = {
                title: notification.title,
                message: notification.message,
                phone: notification.phone,
                email: notification.email
            }
            if (notification.medium.includes('whatsApp')) {
                result = streamWhatsapp.write(eventTypeByTopic.toBuffer(obj));
                
            }
            if (notification.medium.includes('slack')) {
                result = streamSlack.write(eventTypeByTopic.toBuffer(obj));
            }
            if (notification.medium.includes('sms')) {
                result = streamEmail.write(eventTypeByTopic.toBuffer(obj));
            }
            if (notification.medium.includes('email')) {
                result = streamEmail.write(eventTypeByTopic.toBuffer(obj));
            }
        })

        if (result) {
            console.log("stream written succesffully to last kafka broker");

        } else {
            console.log("stream cannot be written to last kafka broker");
        }
    }

    



}



/**
 * 
 * @param schedule 
 * @param notificationStream 
 * @param userId 
 * @param offerNotification 
 * @param mediums 
 * @param group 
 * @returns 
 */
function scheduler(schedule: string[], notificationStream: notificationBody[], userId: string, offerNotification: Notification, mediums: string[], group: string[]) {
    let cronStr = '';
    const h = 23;
    const m = 59;
    if (schedule.length > 2) {
        if (schedule[2] === "m") {
            cronStr = `* * ${schedule[0]} * *`;
        } else if (schedule[2] === "w") {
            cronStr = `* * * * ${schedule[0]}`;
        }
    } else {
        if (schedule[1] == "d") {
            cronStr = `${m} ${h * parseInt(schedule[0])} * * *`;
        } else if (schedule[1] == "m") {
            cronStr = `* * * ${schedule[0]} *`;
        } else if (schedule[1] == "w") {
            cronStr = `${m} ${h * 7 * parseInt(schedule[0])} * * *`;
        } else if (schedule[1] == "s" && schedule[0] !== "0") { //experimental test
            cronStr = `*/${schedule[0]} * * * * *`;
        }
    }

    console.log(cronStr);



    cron.schedule(cronStr, function() {
        feederValidationFilter(userId, notificationStream, offerNotification, mediums, group);
        console.log("notificationStream running ...");
    });
}


/**
 * 
 * @param userId 
 * @param notificationStream 
 * @param offerNotification 
 * @param mediums 
 * @param group 
 * @returns 
 */
function feederValidationFilter(userId: string, notificationStream: notificationBody[], offerNotification: Notification, mediums: string[], group: string[]) {

    const stream = Kafka.Producer.createWriteStream({
        'metadata.broker.list': 'localhost:9092'
    }, {}, { topic: 'test' });
    
    if (userId != '*' && userId.length > 1) {
        // throw an error
        notificationStream = users.filter(user => user.id === userId)
            .map(({ group, ...keep }) => keep)
            .map(ele => ({ ...ele, message: offerNotification.message }))
            .map(ele => ({ ...ele, title: offerNotification.title }));

    } else {

        if (mediums.includes('*') || group.includes('*')) {
            notificationStream = users.map(({ group, ...keep }) => keep)
                .map(ele => ({ ...ele, message: offerNotification.message }))
                .map(ele => ({ ...ele, title: offerNotification.title }));
        } else {
            notificationStream = users.filter(user => user.medium.some(ele => mediums.includes(ele)))
                .filter(user => user.group.some(ele => group.includes(ele)))
                .map(({  group, ...keep }) => keep)
                .map(ele => ({ ...ele, message: offerNotification.message }))
                .map(ele => ({ ...ele, title: offerNotification.title }));
        }
    }
    
    notificationStream.forEach(ele => {
        // console.log("loggin inside feeder validator",ele);
        const obj = {
            id : ele.id,
            title : ele.title,
            message: ele.message,
            phone : ele.phone,
            email: ele.email,
            freq: ele.freq,
            medium: Array.from(ele.medium)
        }
        const result = stream.write(eventType.toBuffer(obj));
        if (result) {
            console.log("stream written succesffully");
           
        } else {
            console.log("stream cannot be written");
        }
    })
    
}

