import Kafka from "node-rdkafka";
import { eventTypeByTopic } from "../../models/eventByTopic";

export const whatsAppHandler = () => {

    const consumer = new Kafka.KafkaConsumer({
        'group.id': 'kafka',
        'metadata.broker.list': 'localhost:9092'
    }, {});

    consumer.connect();
    consumer.on('ready', () =>{
        console.log('whatsAppConsumer ready !');
        consumer.subscribe(['whatsapp']);
        consumer.consume();
    }).on('data',(data) => {
        let testObj;
        if(data != undefined || null){
            console.log("Final whatsapp output",JSON.parse(JSON.stringify(eventTypeByTopic.fromBuffer(data?.value ?? Buffer.from('corrupted data')))));
        }
    });

}