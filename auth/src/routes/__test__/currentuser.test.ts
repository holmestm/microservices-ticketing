import request from 'supertest';
import { app } from '../../app';
import { CookieAccessInfo } from 'cookiejar';

it('responds with details about the current user', async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});

it('session management should work across requests', async () => {
  const agent = request.agent(app); //agent will emulate browser cookie behaviour

  await agent
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  let response = await agent.get('/api/users/currentuser').send().expect(200);
  expect(response.body.currentUser?.email).toEqual('test@test.com');

  await agent.post('/api/users/signout').send({}).expect(200);

  response = await agent.get('/api/users/currentuser').send().expect(200);
  expect(response.body.currentUser).toBeNull();

});
