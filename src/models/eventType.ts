import avro, { types } from 'avsc';
import { Type } from 'avsc';

const eventType = avro.Type.forSchema({
    type: 'record',
    name: 'notification',
    fields: [
        {
            name: 'id',
            type: 'string'
        },
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
            type: Type.forValue(['slack','w'])
        },
        {
            name: 'freq',
            type: Type.forValue(['1', 'default'])
        }
    ]
});


export { eventType };
