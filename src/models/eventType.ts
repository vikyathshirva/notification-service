import avro from 'avsc';

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
    ]
});


export { eventType };
