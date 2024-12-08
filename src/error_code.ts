export default {
	// general
	AUTHENTICATION_REQUIRED:'AUTHENTICATION_REQUIRED',
	INTERNAL_ERROR:'INTERNAL_ERROR',
	INCONSISTENT_STORAGE:'INCONSISTENT_STORAGE',
}

export function err(code) {
	return {
		__typename: 'Error',
		code
	};
}
