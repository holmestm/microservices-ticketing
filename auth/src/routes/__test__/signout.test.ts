import request from 'supertest';
import { app } from '../../app';
import { Cookie, CookieAccessInfo } from 'cookiejar';

it('clears the cookie after signing out', async () => {
  const agent = request.agent(app); //agent will emulate browser cookie behaviour

  await agent
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  const sessionCookie = agent.jar.getCookie('express:sess', CookieAccessInfo.All);
  expect(sessionCookie.value).toBeDefined();
  expect(sessionCookie.expiration_date).toBe(Infinity);
 
  const response = await agent
    .post('/api/users/signout')
    .send({})
    .expect(200);

  expect(agent.jar.getCookies(CookieAccessInfo.All)).toHaveLength(0);
  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
