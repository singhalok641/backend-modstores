import {SECRET_CODE} from '../config';

export default function secretCodeMiddleware(req, res, next) {
	const secretCode = req.body.secretCode || req.query.secretCode;
	//console.log(req.body);
	//console.log(secretCode);
	if (secretCode === SECRET_CODE) {
		next();
	}
	else {
		res.json({error: '\'secretCode\' doesn\'t match'});
	}
}