const config = {
	schemaRegistryHost: `http://gql-schema-registry:3000`,
	selfUrl: "alerts:4560",
	mysql: {
		host: 'mysql',
		port: '3306',
		user: 'test',
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
