'use strict'
let express = require('express')
let router = express.Router()
let User = require('../models/user.js')
const msal = require('@azure/msal-node');
const { msalConfig } = require('../public/javascripts/Auth/authConfig.js')

// console.log('!!!!2222', msalConfig);
const pca = new msal.PublicClientApplication(msalConfig);
let targetURI

function authenticate(name, pass, req, res, next, succesAuthentificate, id) {
    User.authenticate(
        name,
        pass,
        function(error, user) {
            if (error || !user) {
                let err = new Error(
                    'wrong name or pass2' + '---' + user + '----' + error,
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
        id,
    )
}

router.get('/login', async function(req, res, next) {
    res.render('userview')
    // const authCodeUrlParameters = {
    //     scopes: ['user.read'],
    //     redirectUri: 'http://localhost:3000/redirect',
    // };

    // try {
    //     const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);
    //     res.redirect(authCodeUrl);
    // } catch (error) {
    //     console.error('Error generating Auth Code URL:', error);
    //     res.status(500).send('Authentication error');
    // }

})
router.get('/redirect', async (req, res, next) => {
    // console.log(res.account.username)

    // const tokenRequest = {
    //     code: req.query.code,
    //     scopes: ['user.read'],
    //     redirectUri: 'http://localhost:3000/redirect',
    // };

    // try {
    //     const response = await pca.acquireTokenByCode(tokenRequest);
    //     console.log('Access Token:', response.accessToken);
    //     // Store access token in session or proceed as needed
    //     res.send('Login successful! Access Token acquired.');
    // } catch (error) {
    //     console.error('Error acquiring token by code:', error);
    //     res.status(500).send('Error during authentication');
    // }
    next()
});
// router.post('/login', function(req, res, next) {
//     if (req.body.uname && req.body.upass) {
//         authenticate(
//             req.body.uname,
//             req.body.upass,
//             req,
//             res,
//             next,
//             function() {
//                 res.redirect('/')
//             },
//         )
//     } else {
//         let err = new Error('all fields are required')
//         err.status = 400
//         return next(err)
//     }
// })

router.get('*', function(req, res, next) {
    requiresLogin(req, res, next)
})

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        if (targetURI) {
            res.redirect(targetURI)
            targetURI = null
        } else {
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
        authenticate(username, pass, req, res, next, function() {
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
            function() {
                return next()
            },
            st,
        )
    } else {
        targetURI = req.url
        res.redirect('/login')
    }
}
module.exports = router
