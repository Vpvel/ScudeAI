const express = require('express');
const { sendOTP,updateUserDetails,verifyOTP,getUserDetials} = require('../controller/userController');
const router = express.Router();

router.post('/sendotp',sendOTP);
router.post('/updateuser',updateUserDetails)
router.post('/verifyotp',verifyOTP)
router.post('/getuserdetails',getUserDetials)



module.exports = router;
