import Kafka from "node-rdkafka";
import { eventTypeByTopic } from "../../models/eventByTopic";


/**
 * This is the handler for email types, usually any other third paty vendors can be integrated here,
 * as we receive the data directly from the kafka broker which can be fed into another service
 */
export const emailHandler = async () => {

    const consumerEmail = new Kafka.KafkaConsumer({
        'group.id': 'kafka',
        'metadata.broker.list': 'localhost:9092'
    }, {});

    await consumerEmail.connect();
    await consumerEmail.on('ready', () => {
        console.log('email consumer ready !');
        consumerEmail.subscribe(['email']);
        consumerEmail.consume();
    }).on('data', (data) => {
        console.log('CONSUMER 2 : hit (email)');
        // let testObj;
        if (data != undefined || null) {
            console.log("Final email output", JSON.parse(JSON.stringify(eventTypeByTopic.fromBuffer(data?.value ?? Buffer.from('corrupted data')))));

        }
    });

}