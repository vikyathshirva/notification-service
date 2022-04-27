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
import { Stream } from "stream";
import { streams } from "avsc/types";
import { eventType } from "../models/eventType";
import { WatchEventType } from "fs";




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
        notificationStream = feederValidationFilter(userId, notificationStream, offerNotification, mediums, group);
    } else {
        notificationStream.push(Object.assign(scheduler(schedule, notificationStream, userId, offerNotification, mediums, group)));

        console.log("set up cron jobs for scheduling");
    }
    console.log("notification feeder reached");
    function queueMessage() {
        notificationStream.forEach(ele => {
            const obj = {
                title : ele.title,
                message : ele.message,
                phone : ele.phone,
                email: ele.email
            }
            const result = stream.write(eventType.toBuffer(obj));
            if (result) {
                console.log("stream written succesffully");;
            } else {
                console.log("stream cannot be written");;
            }
        })

    }

    const stream = Kafka.Producer.createWriteStream({
        'metadata.broker.list': 'localhost:9092'
    }, {}, { topic: 'test' });


    setInterval(() => {
        queueMessage();
    }, 4000)



    const consumer = new Kafka.KafkaConsumer({
        'group.id': 'kafka',
        'metadata.broker.list': 'localhost:9092'
    }, {});
    consumer.connect();
    consumer.on('ready', ()=>{
        console.log("consumer ready");

        consumer.subscribe(['test']);
        consumer.consume(); 
    }).on('data', (data )=>{
        
        console.log(`received ${eventType.fromBuffer(data.value}`);
    })

};



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



    cron.schedule(cronStr, function () {
        notificationStream = feederValidationFilter(userId, notificationStream, offerNotification, mediums, group);
        // console.log("notificationStream running ...");
    });
    return notificationStream;
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
    if (userId != '*' && userId.length > 1) {
        // throw an error
        notificationStream = users.filter(user => user.id === userId)
            .map(({ id, group, medium, ...keep }) => keep)
            .map(ele => ({ ...ele, message: offerNotification.message }))
            .map(ele => ({ ...ele, title: offerNotification.title }));

    } else {

        if (mediums.includes('*') || group.includes('*')) {
            notificationStream = users.map(({ id, group, medium, ...keep }) => keep)
                .map(ele => ({ ...ele, message: offerNotification.message }))
                .map(ele => ({ ...ele, title: offerNotification.title }));
        } else {
            notificationStream = users.filter(user => user.medium.some(ele => mediums.includes(ele)))
                .filter(user => user.group.some(ele => group.includes(ele)))
                .map(({ id, group, medium, ...keep }) => keep)
                .map(ele => ({ ...ele, message: offerNotification.message }))
                .map(ele => ({ ...ele, title: offerNotification.title }));
        }
    }
    return notificationStream;
}

