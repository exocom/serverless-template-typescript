import faker from 'faker';
import request from 'request';

const fakeUser = () => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    profile: {
      name: faker.name.findName(),
      gender: Math.round(Math.random()) == 1 ? 'Male' : 'Female',
      website: faker.internet.url(),
      location: faker.address.streetAddress() + faker.address.city() + faker.address.country(),
      //bio: faker.lorem.sentences(),
      picture: faker.image.avatar()
    }
  }
};

for (let i = 0; i <= 20; i++) {
  request({uri: 'http://localhost:5000/http/users', method: 'POST', json: fakeUser()}, function (err, res, body) {
    console.log(err);
    console.log(res);
    console.log(body);
  });
}