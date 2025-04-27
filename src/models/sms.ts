// import twilio from 'twilio';
// import cron from 'node-cron';
//
// import config from '../config'
//
// const client = twilio(
//     config.twilio.accountSid,
//     config.twilio.authToken
// );
//
// // run once a day at 9am
// cron.schedule('0 9 * * *', () => {
//     let phoneNumber = ''
//
//     client.messages.create({
//             body: `Hey beekeeper. There is a storm incoming!
// Your Tallinn Apiary 1 is in danger.
// https://gratheon.com`,
//             messagingServiceSid: config.twilio.messagingServiceSid,
//             to: phoneNumber,
//         })
//         .then(message => console.log(message.sid));
// })
//

import { alertChannelModel } from './alertChannel';

// Example function to check if SMS should be sent
export async function shouldSendSms(user_id) {
  const config = await alertChannelModel.getConfig(user_id);
  if (!config || !config.enabled) return false;
  const now = new Date();
  const current = now.getHours() + now.getMinutes() / 60;
  const [startH, startM] = (config.time_start || '00:00').split(':').map(Number);
  const [endH, endM] = (config.time_end || '23:59').split(':').map(Number);
  const start = startH + startM / 60;
  const end = endH + endM / 60;
  return current >= start && current < end;
}
