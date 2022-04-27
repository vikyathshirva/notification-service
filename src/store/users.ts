import { User } from "../models/user";


let users : User [] = [
    {
        id: 'ha82rhlksjdf',
        phone: '9827381823',
        group: ['A', 'B'],
        email: 'asdf@adksf.com',
        medium: [ 'whatsApp','slack'],
        freq: ['default'],
        sub : true
    },
    {
        id: 'hlsry3845',
        phone: '9827381823',
        email: 'asdf@adksf.com',
        group: ['A', 'B'],
        medium: [ 'slack','sms'],
        freq: ['1','m'],
        sub: true
    },
    {
        id: 'hlsry38452',
        phone: '9827381823',
        group: ['A', 'B'],
        email: 'vik@vik.com',
        medium: ['whatsApp'],
        freq: ['1'],
        sub: true
    },
    {
        id: 'hlsry38453',
        phone: '9827381823',
        group: ['A', 'B'],
        email: 'asdf@adksf.com',
        medium: [ 'slack','sms'],
        freq: ['default'],
        sub: false
    },
    {
        id: 'hlsry38451',
        phone: '9827381823',
        group: ['A', 'B'],
        email: 'asdf@adksf.com',
        medium: [ 'slack','sms','whatsApp'],
        freq: ['1'],
        sub: true
    },
    {
        id: 'hlsry38459',
        phone: '9827381823',
        group: ['A', 'B'],
        email: 'asdf@adksf.com',
        medium: [ 'slack','email'],
        freq: ['default'],
        sub: true
    }
];

export {users};


