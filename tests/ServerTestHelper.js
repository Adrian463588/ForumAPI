/* istanbul ignore file */
import request from 'supertest';

const ServerTestHelper = {
  async getAccessToken(app) {
    // Register user
    await request(app).post('/users').send({
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });

    // Login to get access token
    const loginResponse = await request(app).post('/authentications').send({
      username: 'dicoding',
      password: 'secret',
    });

    return loginResponse.body.data.accessToken;
  },

  async getAccessTokenAndUserId(app) {
    // Register user
    const userResponse = await request(app).post('/users').send({
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });

    // Login to get access token
    const loginResponse = await request(app).post('/authentications').send({
      username: 'dicoding',
      password: 'secret',
    });

    return {
      accessToken: loginResponse.body.data.accessToken,
      userId: userResponse.body.data.addedUser.id,
    };
  },
};

export default ServerTestHelper;
