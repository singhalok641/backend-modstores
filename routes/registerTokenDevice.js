const TokenDevice = require('../models/TokenDevice');

/**
 * Register token device
 * @tokenDevice: string
 * @userId: string
 */
async function regiterTokenDevice(req, res) {
	try {
		const tokenDevice = req.body.tokenDevice;
		const userId = req.body.userId;
		var val;
		TokenDevice.checkExistsToken(tokenDevice,async function(err, device){
			if(err){
      			throw err;
    		}
			//console.log(device);
			//console.log(tokenDevice);
			if(device != null){
				if (device.tokenDevice === tokenDevice)  {
					//console.log("isExists");
					res.json({
						error: true,
						message: "Token have registed"
					});
					return;
				}
			}
			else {
				//console.log("doesn't");
				let device = new TokenDevice({
				tokenDevice, userId
				});
				device = await device.save();
				res.json({device});
			}
		});			
	}
	catch (e) {
		console.log(e);
	}
}

export default regiterTokenDevice;