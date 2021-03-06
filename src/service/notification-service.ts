import { notifications } from "../store/notification-message";
import { users } from "../store/users";
import { notificationPayload } from "../models/payload";
import { notificationBody } from "../models/notification-response";
import { Notification } from "../models/notification-model";
import cron from "node-cron"
import Kafka from "node-rdkafka"
import { eventType } from "../models/eventType";
import { eventTypeByTopic } from "../models/eventByTopic";
import { whatsAppHandler } from "./third-party-intg/whatsapp-handler";
import { slackHandler } from "./third-party-intg/slack-handler";
import { emailHandler } from "./third-party-intg/email-handler";
import { smsHandler } from "./third-party-intg/sms-handler";
import async from "async";
import { nextTick } from "process";
import { InternalServerError } from "../errors/database-connection-error";

// const eventEmitter = new EventEmitter;




/**
 * Single service function that taken in the payload of the API request 
 * and feeds the Kafka layer notification events after accessing the db 
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

    async.waterfall([
        (next: (arg0: null) => void) => {
            next(null)
        },
        (next: any) => {

            if (adhc) {
                
                feederValidationFilter(userId, notificationStream, offerNotification, mediums, group), next(null, "res");
            } else {
                scheduler(schedule, notificationStream, userId, offerNotification, mediums, group), next(null, "res");
                console.log("set up cron jobs for scheduling");
            }
        },
        (data: any, next: (arg0: null, arg1: string) => void) => {



            rateLimiter(mediums);
            // next(null,"done");

        }
    ], (error: any, result: any) => {
        if (error) {
            throw new InternalServerError();

        } else {
            console.log('async succeeded');


        }
    })


};


/**
 * Rate limiter function that is placed right after the kafka broker
 * takes in a preference array and limit (usually injected using a db query or options through API)
 * further filters the db query using the preferences that is sent
 * Additionally can use a cache layer and to reduce db hits continuously,
 * can also perform counting of requests for adding reporting on top of this to perform some more rate limiting (ex.. payed API requests)
 * @param mediums 
 */
function rateLimiter(mediums: any) {
    let received: any[] = [];
    let limit = 1;
    async.waterfall([

        async (next: (arg0: any, arg1: string) => any) => {
            whatsAppHandler();
            // slackHandler();
            // emailHandler();
            // smsHandler();
            console.log('rate limiter hit');
            const consumeInit = new Kafka.KafkaConsumer({
                'group.id': 'kafka',
                'metadata.broker.list': 'localhost:9092'
            }, {});


            consumeInit.connect();
            consumeInit.on('ready', () => {

                // emailHandler();

                console.log("consumer ready");
                consumeInit.subscribe(['test']);
                consumeInit.consume();
            }).on('data', (data) => {
                console.log('CONSUMER 1 : hit');
                // notificationHandler(data);
                // old ternary : received.push(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')))

                if ((data !== undefined || null) && limit !== 0) {
                    let testObj = JSON.parse(JSON.stringify(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')))).freq[0];
                    (testObj === 'default' || parseInt(testObj) >= limit) ? notificationHandler(data, mediums) : "";
                    // console.log(`received  : ${eventType.fromBuffer(data.value)}`);
                } else if (limit === 0) {
                    // received.push(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')));
                    notificationHandler(data, mediums);
                }


                // console.log(`received:  ${eventType.fromBuffer(data?.value ?? Buffer.from('error handling inside here//'))}`);
                // console.log("storage array",received);
            }).on('connection.failure', () => { next(Error('connection.failure'), "error") })
                .on('rebalance.error', () => { next(Error('rebalance.error'), "error") })
                .on('disconnected', () => { next(Error('disconnected'), "error") })
                .on('event.error', () => { next(Error('event.error'), "error") })
                .on('unsubscribed', () => { next(null, "asdf") });

        }
    ], (err, res) => {
        if (err) {
            throw new InternalServerError();
        } else {

            console.log("exiting RL");


        }

    })










}

/**
 * Additional notification handler for modifying some fields or filtering,
 * usually this is where we would fetch more details from db if we needed to
 *  Use this to transform data or removed fields
 * @param ele 
 */
function notificationHandler(data: any, mediums: any) {
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

    // received.push(data);
    // let testObj;
    // if ((data !== undefined || null) && limit !== 0) {
    //     testObj = JSON.parse(JSON.stringify(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')))).freq[0];
    //     (testObj === 'default' || parseInt(testObj) >= limit) ? received.push(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data'))) : "";
    //     // console.log(`received  : ${eventType.fromBuffer(data.value)}`);
    // } else if (limit == 0) {
    //     received.push(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')));
    // }
    // console.log(`received:  ${eventType.fromBuffer(data?.value ?? Buffer.from('error handling inside here//'))}`);
    // console.log("storage array", received);

    async.waterfall([
        (next: (arg0: null, arg1: string) => void) => {
            if (data != null) {
                let allRecieved = [];
                let testObj = JSON.parse(JSON.stringify(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data'))))
                allRecieved.push(testObj);
                console.log("mediums", mediums);


                if (mediums.includes('whatsApp') && testObj.medium.some((ele: any) => mediums.includes(ele))) {
                    let obj = {
                        title: testObj.title,
                        message: testObj.message,
                        phone: testObj.phone,
                        email: testObj.email
                    }
                    let resultWhatsapp = streamWhatsapp.write(eventTypeByTopic.toBuffer(obj));
                    if (resultWhatsapp) {

                        console.log("PRODUCER 2 : stream written succesffully to whatsapp kafka broker");

                    } else {
                        console.log("PRODUCER 2 : stream cannot be written to whatsapp kafka broker");
                    }

                }
                if (mediums.includes('slack') && testObj.medium.some((ele: any) => mediums.includes(ele))) {
                    let obj = {
                        title: testObj.title,
                        message: testObj.message,
                        phone: testObj.phone,
                        email: testObj.email
                    }
                    let resultSlack = streamSlack.write(eventTypeByTopic.toBuffer(obj));
                    if (resultSlack) {

                        console.log("PRODUCER 2 : stream written succesffully to slack kafka broker");

                    } else {
                        console.log("PRODUCER 2 : stream cannot be written to slack kafka broker");
                    }
                }
                if (mediums.includes('sms') && testObj.medium.some((ele: any) => mediums.includes(ele))) {
                    let obj = {
                        title: testObj.title,
                        message: testObj.message,
                        phone: testObj.phone,
                        email: testObj.email
                    }
                    let resultSms = streamSms.write(eventTypeByTopic.toBuffer(obj));
                    if (resultSms) {
                        console.log("PRODUCER 2 :  stream written succesffully to sms kafka broker");

                    } else {
                        console.log("PRODUCER 2 : stream cannot be written to sms kafka broker");
                    }
                }

                //checker && mediums.some(ele => testObj.medium.includes(ele))
                if (mediums.includes('email') && testObj.medium.some((ele: any) => mediums.includes(ele))) {
                    let obj = {
                        title: testObj.title,
                        message: testObj.message,
                        phone: testObj.phone,
                        email: testObj.email
                    }
                    let resultEmail = streamEmail.write(eventTypeByTopic.toBuffer(obj));
                    if (resultEmail) {
                        console.log("PRODUCER 2 : stream written succesffully to email kafka broker");

                    } else {
                        console.log("PRODUCER 2 : stream cannot be written to email kafka broker");
                    }
                }

            }



            next(null, "done");
        }], (error, result) => {
            if (error) {
                throw new InternalServerError();

            } else {

                console.log("scucess");

            }

        })







}



/**
 * Scheduler which sets up a cron job in the background to perform timed notification if prefered by the users
 * cancellation can also be performed by the same function, currently its left out
 * supports a typical cron job format which can be fed into the function by receiving the data from API as it is sent
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
        feederValidationFilter(userId, notificationStream, offerNotification, mediums, group);
        console.log("notificationStream running ...");
    });
}


/**
 * 
 * Performs first layer of validation expecially by filtering using API options sent
 * typically would use a database access from here, but that is left out for now
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





    async.waterfall([
        (next: any) => {

            if (userId != '*' && userId.length > 1) {
                // throw an error
                notificationStream = users.filter(user => user.id === userId)
                    .map(({ group, ...keep }) => keep)
                    .map(ele => ({ ...ele, message: offerNotification.message }))
                    .map(ele => ({ ...ele, title: offerNotification.title })), next(null, notificationStream);

            } else {

                if (mediums.includes('*') || group.includes('*')) {
                    notificationStream = users.map(({ group, ...keep }) => keep)
                        .map(ele => ({ ...ele, message: offerNotification.message }))
                        .map(ele => ({ ...ele, title: offerNotification.title })), next(null, notificationStream);
                } else {
                    notificationStream = users.filter(user => user.medium.some(ele => mediums.includes(ele)))
                        .filter(user => user.group.some(ele => group.includes(ele)))
                        .map(({ group, ...keep }) => keep)
                        .map(ele => ({ ...ele, message: offerNotification.message }))
                        .map(ele => ({ ...ele, title: offerNotification.title })), next(null, notificationStream);
                }
            }

        },
        (notificationStream: any[], next: (arg0: null, arg1: string) => void) => {
            // console.log(notificationStream);
            notificationStream.forEach(ele => {
                // console.log("loggin inside feeder validator",ele);
                const obj = {
                    id: ele.id,
                    title: ele.title,
                    message: ele.message,
                    phone: ele.phone,
                    email: ele.email,
                    freq: ele.freq,
                    medium: Array.from(ele.medium)
                }
                const result = stream.write(eventType.toBuffer(obj));
                if (result) {
                    console.log("PRODUCER 1 : stream written succesffully");

                } else {
                    console.log("PRODUCER 1 : stream cannot be written");
                    (new Error('cannot be written'))
                }
            })

            next(null, "result");
        }

    ], (error: any, result: any) => {

        if (error) {
            throw new InternalServerError();
        } else {
            //    console.log("exiting FV validator succesfully");
        }

    })







}

