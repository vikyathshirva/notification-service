import avro, { types } from 'avsc';
import { Type } from 'avsc';

const eventTypeByTopic = avro.Type.forSchema({
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
        }
    ]
});


export { eventTypeByTopic };
