import Kafka from "node-rdkafka";
import { eventTypeByTopic } from "../../models/eventByTopic";


/**
 * This is the handler for sms types, usually any other third paty vendors can be integrated here,
 * as we receive the data directly from the kafka broker which can be fed into another service
 */
export const smsHandler = async () => {

    const consumerSms = new Kafka.KafkaConsumer({
        'group.id': 'kafka',
        'metadata.broker.list': 'localhost:9092'
    }, {});

    await consumerSms.connect();
    await consumerSms.on('ready', () => {
        console.log('sms consumer ready !');
        consumerSms.subscribe(['sms']);
        consumerSms.consume();
    }).on('data', (data) => {
        console.log('CONSUMER 2 : hit (sms)');
        // let testObj;
        if (data != undefined || null) {
            console.log("Final sms output", JSON.parse(JSON.stringify(eventTypeByTopic.fromBuffer(data?.value ?? Buffer.from('corrupted data')))));

        }
    });

}