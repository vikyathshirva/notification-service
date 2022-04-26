import request from 'supertest';
import { app } from '../../app'; 


it('returns a 201 on succesful push', ()=>{
    return request(app)
    .post('api/v1/notifications') 
    .send({
        email : 'test@gmail.com',
        message : 'New offer 29% off !!!'
    })

    .expect(201);
})
