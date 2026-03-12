const config = {

	// use paid messaging service by twilio
	// https://console.twilio.com/us1/develop/sms/services
	twilio:{
		accountSid: '',
		authToken: '',
		messagingServiceSid: ''
	},


	schemaRegistryHost: `http://gql-schema-registry:3000`,
	selfUrl: "alerts:4560",
	postgres: {
		host: process.env.DB_HOST || 'postgres',
		port: process.env.DB_PORT || '5432',
		user: process.env.DB_USER || 'test',
		password: process.env.DB_PASSWORD || 'test',
		database: process.env.DB_NAME || 'alerts',
	},

	// this must match graphql-router
	JWT_KEY: '',
	
	// AWS SES for email delivery
	aws: {
		region: 'eu-west-1',
		accessKeyId: '',
		secretAccessKey: '',
		sesFromEmail: 'pilot@gratheon.com'
	},
	
	// Telegram Bot API
	telegram: {
		botToken: ''
	},
	
	clarifai: {
		translation_PAT: ''
	},
};

export default config;
