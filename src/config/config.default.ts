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
	mysql: {
		host: 'mysql',
		port: '3306',
		user: 'root',
		password: 'test',
		database: 'alerts',
	},

	// this must match graphql-router
	JWT_KEY: '',
	SENDGRID_API_KEY: '',
	clarifai: {
		translation_PAT: ''
	},
};

export default config;
