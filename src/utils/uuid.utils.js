const xid	= require('xid-js');

/**
 * Generate an unique id
 * @use this method is used when an thread is going to be created
 * @return xid value
 */
const generateUuid = () => {

	// generate an id
	return xid.next();
};

module.exports = { generateUuid };