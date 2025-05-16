'use strict'
let express = require('express')
let router = express.Router()
let User = require('../models/user.js')

let targetURI

const msal = require('@azure/msal-node')
const { dateForOrders } = require('../controllers/helperController.js')

const config = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
    },
}
const pca = new msal.ConfidentialClientApplication(config)

function authenticate(name, pass, req, res, next, succesAuthentificate, id) {
    User.authenticate(
        name,
        pass,
        function (error, user) {
            if (error || !user) {
                let err = new Error(
                    'wrong name or pass.' + '---' + user + '----' + error
                )
                err.status = 401
                return next(err)
            } else {
                req.session.userId = user._id
                res.cookie('bwebuserid', user._id, {
                    maxAge: 1000 * 60 * 60 * 24 * 7,
                }) // max age = 7 days
                succesAuthentificate()
            }
        },
        id
    )
}

router.get('/loginview', async function (req, res, next) {
    console.log('loginview')
    res.render('loginview')
})

router.get('/login', async function (req, res, next) {
    console.log('login')
    const authCodeUrlParameters = {
        scopes: ['user.read'],
        redirectUri: process.env.REDIRECT_URI,
    }

    pca.getAuthCodeUrl(authCodeUrlParameters)
        .then((response) => {
            res.redirect(response)
        })
        .catch((error) => console.log(JSON.stringify(error)))
})

router.get('/logout', async function (req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            console.log(JSON.stringify(err))
            return res.sendStatus(500) // Error occurred
        }
        res.clearCookie('idToken')
        res.clearCookie('bwebuserid')
        res.render('loginview')
    })
})

router.get('/auth/redirect', (req, res) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ['user.read'],
        redirectUri: process.env.REDIRECT_URI,
    }
    console.log('\x1b[36m%s\x1b[0m', 'auth redirect')
    pca.acquireTokenByCode(tokenRequest)
        .then((response) => {
           // console.dir(response)

            let userName = response.account.username
            req.session.tokenResponse = response // Store the token response in session
            req.session.tokenExpiry = Date.now() + response.expiresIn * 1000 // Calculate and store token expiry time
            console.log('auth user', userName)
            User.findOne({ $or: [{ username: userName }] })
                .exec(function (err, user) {
                    if (err) {
                        console.log('login err', err)
                        res.redirect('/loginview')
                    } else if (!user) {
                        console.log('user not found', userName)
                        res.redirect('/loginview')
                    } else {
                        req.session.account = response.account.username
                        console.log(req.session.account)
                        res.cookie('idToken', response.idToken, {
                            httpOnly: true,
                        })
                        res.redirect('/wiki')
                    }
                })
        })
        .catch((error) => console.log(error))
})

// Middleware to check token expiration and refresh if necessary
router.use(async function (req, res, next) {
    if (req.session.tokenResponse) {
        const now = Date.now()
        const expirationBuffer = 5 * 60 * 1000 // 5 minutes before actual expiration
        console.log('middleware token',req.session.tokenExpiry)
        console.log(new Date().toISOString())
        if (req.session.tokenExpiry - now < expirationBuffer) {

            console.log('middleware token update')
            const account = req.session.tokenResponse.account
            const silentRequest = {
                account: account,
                scopes: ['user.read'],
            }

            try {
                req.session.tokenResponse = await pca.acquireTokenSilent(silentRequest)
                req.session.tokenExpiry = req.session.tokenResponse.expiresOn
                console.log('Token refreshed successfully',req.session.tokenExpiry)
                console.dir(req.session.tokenResponse)
            } catch (error) {
                console.log('Silent token acquisition failed, redirecting to login')
                return res.redirect('/login')
            }
        }
    }
    next()
})

router.get('*', function (req, res, next) {
    requiresLogin(req, res, next)
})

function requiresLogin(req, res, next) {
    if (req.session.account) {
        console.log('session account', req.session.account)
        if (targetURI) {
            console.log('targetURI', targetURI)
            res.redirect(targetURI)
            targetURI = null
        } else {
            console.log('next',req.url)
            return next()
        }
    } else if (
        req.cookies.cookiename &&
        (req.url === '/order/exportWithEmptyLocalId' ||
            req.url === '/order/update')
    ) {
        let values = req.cookies.cookiename.split('-')
        let username = values[0]
        let pass = values[1]
        authenticate(username, pass, req, res, next, function () {
            return next()
        })
    } else if (req.cookies.bwebuserid) {
        let st = req.cookies.bwebuserid
        authenticate(
            null,
            null,
            req,
            res,
            next,
            function () {
                return next()
            },
            st
        )
    } else {
        targetURI = req.url
        res.redirect('/loginview')
    }
}
module.exports = router
