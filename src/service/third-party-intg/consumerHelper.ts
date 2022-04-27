import Kafka from "node-rdkafka";

const consumerHelper = new Kafka.KafkaConsumer({
    'group.id': 'kafka',
    'metadata.broker.list': 'localhost:9092'
}, {});
export const consumer = () => {
    const consumer = consumerHelper;

}