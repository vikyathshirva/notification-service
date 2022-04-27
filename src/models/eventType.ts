import avro, { types } from 'avsc';
import { Type } from 'avsc';

const eventType = avro.Type.forSchema({
    type: 'record',
    name: 'notification',
    fields: [
        {
            name: 'title',
            type:  'string'
        },
        { 
            name: 'message', 
            type: 'string' 
        },
        {
            name: 'phone',
            type: 'string'
        },
        {
            name: 'email',
            type: 'string'
        },
        {
            name: 'medium',
            type: Type.forValue(['slack','whatsapp'])
        }
    ]
});


export { eventType };
