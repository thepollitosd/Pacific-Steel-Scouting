import { ConvexHttpClient } from 'convex/browser';
const client = new ConvexHttpClient('https://laudable-corgi-778.convex.cloud');
client.query('events:getActiveEvent').then(event => {
  client.query('teams:getByEvent', { eventId: event._id }).then(res => {
    const t6695 = res.find(r => r.number === 6695);
    const t6995 = res.find(r => r.number === 6995);
    console.log("6695:", t6695?.name);
    console.log("6995:", t6995?.name);
  }).catch(console.error);
});
