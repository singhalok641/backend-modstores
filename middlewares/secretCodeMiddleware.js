//import {SECRET_CODE} from '../config';
const config = require('../config/database');

export default function secretCodeMiddleware(req, res, next) {
	const secretCode = req.body.secretCode || req.query.secretCode;
	console.log(config.secret);
	console.log(secretCode);
	if (secretCode === config.secret) {
		next();
	}
	else {
		res.json({error: '\'secretCode\' doesn\'t match'});
	}
}
