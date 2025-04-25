'use strict'
let express = require('express')
let router = express.Router()
let User = require('../models/user.js')

let targetURI
let account

const msal = require('@azure/msal-node');

const config = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
    },
};
const pca = new msal.ConfidentialClientApplication(config);
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
router.get('/loginview', async function(req, res, next) {
    res.render('loginview')
})
router.get('/login', async function(req, res, next) {
    const authCodeUrlParameters = {
        scopes: ['user.read'],
        redirectUri: process.env.REDIRECT_URI,
    };

    pca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
        res.redirect(response);
    }).catch((error) => console.log(JSON.stringify(error)));

})

router.get('/logout', async function(req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            console.log(JSON.stringify(err));
            return res.sendStatus(500); // Error occurred
        }
        res.clearCookie('idToken')
        account = null
        res.render('loginview')
    });
})

router.get('/auth/redirect', (req, res) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ['user.read'],
        redirectUri: process.env.REDIRECT_URI,
    };

    pca.acquireTokenByCode(tokenRequest).then((response) => {
        let userName = response.account.username

        User.findOne({ $or: [{ username: userName }] })
        // User.findOne({_id:id})
            .exec(function(err, user) {
                if (err) {
                    console.log('login err', err)
                    res.redirect('/loginview')
                } else if (!user) {
                    console.log('user not found', userName)
                    res.redirect('/loginview')
                } else {
                    account = response.account.username
                    console.log(account)
                    res.cookie('idToken', response.idToken, { httpOnly: true });
                    // res.send('Login successful');
                    res.redirect('/wiki')
                }
            }
            )


    }).catch((error) => console.log(error));
});


router.get('*', function(req, res, next) {
    requiresLogin(req, res, next)
})

function requiresLogin(req, res, next) {

    console.log('used acc', account)


    if (account === 'ka1207424@gmail.com') {
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
        res.redirect('/loginview')
    }
}
module.exports = router
