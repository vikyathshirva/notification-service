import Kafka from "node-rdkafka";
import { eventTypeByTopic } from "../../models/eventByTopic";

export const slackHandler = async () => {

    const consumerSlack = new Kafka.KafkaConsumer({
        'group.id': 'kafka',
        'metadata.broker.list': 'localhost:9092'
    }, {});

    await consumerSlack.connect();
    await consumerSlack.on('ready', () => {
        console.log('slack consumer ready !');
        consumerSlack.subscribe(['slack']);
        consumerSlack.consume();
    }).on('data', (data) => {
        console.log('CONSUMER 2 : hit (Slack)');
        // let testObj;
        if (data != undefined || null) {
            console.log("Final slack output", JSON.parse(JSON.stringify(eventTypeByTopic.fromBuffer(data?.value ?? Buffer.from('corrupted data')))));
            
        }
    });

}