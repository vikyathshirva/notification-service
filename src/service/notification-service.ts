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

// const eventEmitter = new EventEmitter;




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

    async.waterfall([
        (next: (arg0: null) => void) => {

            next(null)
        },
        (next: any)=>{
    
            if (adhc) {
                
                feederValidationFilter(userId, notificationStream, offerNotification, mediums, group), next(null, "res");
            } else {
                
                scheduler(schedule, notificationStream, userId, offerNotification, mediums, group), next(null, "res");
                console.log("set up cron jobs for scheduling");
            }
        },
        (data: any, next: (arg0: null, arg1: string) => void)=>{

            
            
            rateLimiter(mediums);
            // next(null,"done");
            
        }
    ],(error: any, result: any)=>{
        if(error){
            console.log('Error occured');
            
        }else{
            console.log('async succeeded');   
            
           
        }
    })


};

/**
 * Can implement a cache layer to check for limiting, but will skip that part
 */
 function rateLimiter(mediums : any){
    let received: any[] = [];
    let limit = 1;
    async.waterfall([
        
        async (next: (arg0: any, arg1: string) => any)=>{
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
                    (testObj === 'default' || parseInt(testObj) >= limit) ? notificationHandler(data,mediums) : "";
                    // console.log(`received  : ${eventType.fromBuffer(data.value)}`);
                } else if (limit === 0) {
                    // received.push(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data')));
                    notificationHandler(data, mediums);
                }


                // console.log(`received:  ${eventType.fromBuffer(data?.value ?? Buffer.from('error handling inside here//'))}`);
                // console.log("storage array",received);
            }).on('connection.failure',()=> {next(Error('connection.failure'),"error")})
                .on('rebalance.error', () => {next(Error('rebalance.error'), "error")})
                .on('disconnected', () => {next(Error('disconnected'), "error")})
                .on('event.error', () => {next(Error('event.error'), "error")})
                .on('unsubscribed', () => {next(null, "asdf")});    

        }
    ],(err,res)=> {
        if(err){
            console.log(`error occurred ${err}`);
        }else{  
            
            console.log("exiting RL");
            
            
        }

    })
    
    
        

      

      


    
}

/**
 *  Use this to transform data or removed fields
 * @param ele 
 */
function notificationHandler(data : any, mediums: any){
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
                (next: (arg0: null, arg1: string) => void)=>{
                    if (data != null) {
                        let allRecieved = [];
                        let testObj = JSON.parse(JSON.stringify(eventType.fromBuffer(data?.value ?? Buffer.from('corrupted data'))))
                        allRecieved.push(testObj);
                        // console.log("Inside notification handler", testObj.medium);
                        // console.log("Inside notification handler equ check w", testObj.medium.includes('whatsApp'));
                        // console.log("Inside notification handler equ check s", testObj.medium.includes('slack'));
                        
                        console.log("mediums",mediums);
                        

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



                    next(null,"done");
            }],(error, result)=>{
                if(error){
                    console.log("fail");
                    
                }else{
                    
                    console.log("scucess");
                    
                }

            })
 
            


       

    
    

    // let transformationArray = [];
    // transformationArray.push(ele);
    // console.log("transform",transformationArray);
    
    // while( transformationArray.length > 0){
    //     const streamWhatsapp = Kafka.Producer.createWriteStream({
    //         'metadata.broker.list': 'localhost:9092'
    //     }, {}, { topic: 'whatsapp' });

    //     const streamSms = Kafka.Producer.createWriteStream({
    //         'metadata.broker.list': 'localhost:9092'
    //     }, {}, { topic: 'sms' });

    //     const streamSlack = Kafka.Producer.createWriteStream({
    //         'metadata.broker.list': 'localhost:9092'
    //     }, {}, { topic: 'slack' });

    //     const streamEmail = Kafka.Producer.createWriteStream({
    //         'metadata.broker.list': 'localhost:9092'
    //     }, {}, { topic: 'email' });

    //     let result;
    //     transformationArray.forEach(notification => {
    //         let obj = {
    //             title: notification.title,
    //             message: notification.message,
    //             phone: notification.phone,
    //             email: notification.email
    //         }
    //         if (notification.medium.includes('whatsApp')) {
    //             result = streamWhatsapp.write(eventTypeByTopic.toBuffer(obj));
    //             if (result) {
    //                 console.log("stream written succesffully to last kafka broker");

    //             } else {
    //                 console.log("stream cannot be written to last kafka broker");
    //             }
                
    //         }
    //         if (notification.medium.includes('slack')) {
    //             result = streamSlack.write(eventTypeByTopic.toBuffer(obj));
    //             if (result) {
    //                 console.log("stream written succesffully to last kafka broker");

    //             } else {
    //                 console.log("stream cannot be written to last kafka broker");
    //             }
    //         }
    //         if (notification.medium.includes('sms')) {
    //             result = streamEmail.write(eventTypeByTopic.toBuffer(obj));
    //             if (result) {
    //                 console.log("stream written succesffully to last kafka broker");

    //             } else {
    //                 console.log("stream cannot be written to last kafka broker");
    //             }
    //         }
    //         if (notification.medium.includes('email')) {
    //             result = streamEmail.write(eventTypeByTopic.toBuffer(obj));
    //             if (result) {
    //                 console.log("stream written succesffully to last kafka broker");

    //             } else {
    //                 console.log("stream cannot be written to last kafka broker");
    //             }
    //         }
    //     })

        
    // }

   

    



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



    cron.schedule(cronStr,  function() {
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

    



    async.waterfall([
        (next: any)=>{
            
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
                        .map(ele => ({ ...ele, title: offerNotification.title })),next(null,notificationStream);
                } else {
                    notificationStream = users.filter(user => user.medium.some(ele => mediums.includes(ele)))
                        .filter(user => user.group.some(ele => group.includes(ele)))
                        .map(({ group, ...keep }) => keep)
                        .map(ele => ({ ...ele, message: offerNotification.message }))
                        .map(ele => ({ ...ele, title: offerNotification.title })),next(null,notificationStream);
                }
            }

        },
        (notificationStream: any[],next: (arg0: null, arg1: string) => void)  => {
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

            next(null,"result");
        }

    ],(error: any,result : any)=>{
        
        if(error){
            console.log(error.message);
        }else{
        //    console.log("exiting FV validator succesfully");
        }

    })
    
    
    
    
    
    
    
}

