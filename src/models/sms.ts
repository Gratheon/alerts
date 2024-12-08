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
