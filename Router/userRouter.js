import express from 'express'
import {signup,login,forgetPassword,resetPassword,getAllUser} from '../Controller/user.js'

const router = express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.post('/forget-password',forgetPassword)
router.post('/reset-password/:randomString/:expitationTimestamp',resetPassword)
router.get('/getAlluser',getAllUser)


export default router