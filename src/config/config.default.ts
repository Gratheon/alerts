const config = {
	sentryDsn: "",
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

	login_ui_url: 'http://localhost:8080/account/authenticate/',
	app_ui_url: 'http://localhost:8080/apiaries',
};

export default config;
