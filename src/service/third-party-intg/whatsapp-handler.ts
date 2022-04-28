import async from "async";
import Kafka from "node-rdkafka";
import { eventTypeByTopic } from "../../models/eventByTopic";


/**
 * This is the handler for whatsapp types, usually any other third paty vendors can be integrated here,
 * as we receive the data directly from the kafka broker which can be fed into another service
 */
export const whatsAppHandler = async () => {

            const consumerWhatsapp = new Kafka.KafkaConsumer({
                'group.id': 'kafka',
                'metadata.broker.list': 'localhost:9092'
            }, {});

          await consumerWhatsapp.connect();
          await consumerWhatsapp.on('ready', () => {
                console.log('whatsapp consumer ready ');
                consumerWhatsapp.subscribe(['whatsapp']);
                consumerWhatsapp.consume();

            }).on('data', (data) => {
                console.log('CONSUMER 2 : hit (Whatsapp)');
                // let testObj;
                if (data != undefined || null) {
                    console.log("Final whatsapp output", JSON.parse(JSON.stringify(eventTypeByTopic.fromBuffer(data?.value ?? Buffer.from('corrupted data')))));
                    
                }
            });


        
    

}