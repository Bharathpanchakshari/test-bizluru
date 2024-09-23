import express from 'express'
import session from 'express-session'
import { WorkOS } from '@workos-inc/node'
import NodeMailer from 'nodemailer'
import { Client } from "@notionhq/client"
import { v4 } from 'uuid';


const pageId = process.env.NOTION_PAGE_ID
const apiKey = process.env.NOTION_API_KEY
const databaseId= process.env.NOTION_DATABASE_ID
const notion = new Client({ auth: apiKey })
var profileId,profileEmailId,bookingId
const app = express()
const router = express.Router()

app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
    })
)

const workos = new WorkOS(process.env.WORKOS_API_KEY)
const clientID = process.env.WORKOS_CLIENT_ID
const organizationID = 'org_01HB0BREAGZEWECFWDDGCXQFFH'
const redirectURI = 'http://localhost:8000/callback'
const state = ''
session.factors = []
router.get('/', function (req, res) {
    if (session.isloggedin) {
        res.render('login_successful.ejs', {
            profile: session.profile,
            first_name: session.first_name,
        })
    } else {
        res.render('index.ejs', { title: 'Home' })
    }
})

router.get('/profile', function (req, res) {
    if (session.isloggedin) {
        res.render('profile.ejs', {
            profile: session.profile,
            first_name: session.first_name,
        })
    } 
})

router.post('/login', (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');

    const login_type = req.body.login_method

    const params = {
        clientID: clientID,
        redirectURI: redirectURI,
        state: state,
    }


    if (login_type === 'phone') {
        res.redirect('/signup')
    } else {
        params.provider = login_type
    }

    try {
        const url = workos.sso.getAuthorizationURL(params)
        
        res.send({data: url})
        console.log(res)
    } catch (error) {
        res.render('error.ejs', { error: error })
    }
})

router.post('/register',async(req,res)=>{
    try{
       
          var brandname = req.body.brandname
          var products=req.body.products
          var details=req.body.details
          var instaweblink=req.body.instaweblink
          var phonenumber=req.body.phonenumber

          const lastBooking = await notion.databases.query({
            database_id: databaseId,
            filter: {
              property: "profileId",
              rich_text: {
                contains: profileId
              }
            }
          })
        
        if (lastBooking.results.length==0){
            bookingId=v4()
            console.log(brandname)
            console.log(products)
            console.log(details)
            console.log(instaweblink)
            console.log(phonenumber)
            console.log(profileId)
            console.log(profileEmailId)
            console.log(bookingId)
        const pageProperties={
            'Tell us something about your brand': { id: 'A%5EU%3A', type: 'rich_text', rich_text: [ {
              text: {
                content: details,
              },
            }, ] },
            Products: { id: 'Y%3C%40r', type: 'rich_text', rich_text: [ {
              text: {
                content: products,
              },
            },] },
            bookingId: { id: 'ekHH', type: 'rich_text', rich_text: [{
                text: {
                  content: bookingId,
                },
              },] },
            'Phone Number': { id: 'foRp', type: 'phone_number', phone_number: phonenumber },
            'Instagram/Website Link': {
              id: 'iOUE',
              type: 'url',
              url: instaweblink
            },
            profileId: { id: 'm%7D~A', type: 'rich_text', rich_text: [{
                text: {
                  content: profileId,
                },
              },] },
            EmailId: { id: 'yOMu', type: 'email', email: profileEmailId },
            BrandName: { id: 'title', type: 'title', title: [ {
              text: {
                content: brandname,
              },
            },] }
          }
        console.log(pageProperties)
        addNotionPageToDatabase(databaseId,pageProperties)
        sendMail(profileEmailId,bookingId)
        }else{
            res.redirect('/booking')
        }
       
      
    res.redirect('https://bizluru.notion.site/BIZLURU-a7aabd35e23c47aea4e8db1d276bc088')
    }catch (error) {
        res.render('error.ejs', { error: error })
    }
})


async function sendMail(toEmailID,bookingId){
    console.log(toEmailID)
    console.log(bookingId)

    var email_smtp = NodeMailer.createTransport({      
        host: "smtp.gmail.com",
        auth: {
          type: "login", // default
          user: "bizluru@gmail.com",
          pass: "wxgb wzvx pgwt cpcx"
        }
      });
      const mailConfigurations = {
        from: 'bizluru@gmail.com',
        to: toEmailID,
        subject: 'Booking Confirmation : Bizluru',
        text: 'Hi! There, your booking is confirmed'
         + ' with booking id '+bookingId
    };
        
    email_smtp.sendMail(mailConfigurations, function(error, info){
        if (error) throw error;
           console.log('Email Sent Successfully');
        console.log(info);
    });
}

async function addNotionPageToDatabase(databaseId, pageProperties) {
    const newPage = await notion.pages.create({
      parent: {
        type:'database_id',
        database_id: databaseId,
      },
      properties: pageProperties,
    })
    console.log(newPage)
  }

router.get('/callback', async (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    try {
        const { code } = req.query

        const profile = await workos.sso.getProfileAndToken({
            code,
            clientID,
        })
        const json_profile = JSON.stringify(profile, null, 4)

        session.first_name = profile.profile.first_name
        session.profile = json_profile
        session.isloggedin = true
        profileId=profile.profile.id
        profileEmailId=profile.profile.email

        const lastBooking = await notion.databases.query({
            database_id: databaseId,
            filter: {
              property: "profileId",
              rich_text: {
                contains: profileId
              }
            }
          })
          if (lastBooking.results.length==0){
            res.redirect('http://localhost:3000') 
          }else{
            res.redirect('http://localhost:3000') // this needs to be updated by frontend routing
          }

        
    } catch (error) {
        res.render('error.ejs', { error: error })
    }
})

router.get('/logout', async (req, res) => {
    try {
        session.first_name = null
        session.profile = null
        session.isloggedin = null

        res.redirect('/')
    } catch (error) {
        res.render('error.ejs', { error: error })
    }
})

router.get('/signup', (req, res) => {
    session.factors = []
    res.render('enroll_factor.ejs')
})

router.post('/enroll_sms_factor', async (req, res) => {
    let new_factor
    const phone_number = '+91' + req.body.phone_number

    new_factor = await workos.mfa.enrollFactor({
        type: 'sms',
        phoneNumber: phone_number,
    })

    session.factors.push(new_factor)
    
    let message=" {{code}} is your OTP for login to Bizluru.If this OTP was not sent by you just ignore this message."
    session.sms_message=message
    session.current_factor = session.factors[0]
    console.log(session)
    const challenge = await workos.mfa.challengeFactor({
        authenticationFactorId: session.current_factor.id,
        smsTemplate: message,
    })

    session.challenge_id = challenge.id

    res.render('challenge_factor.ejs', { title: 'Challenge Factor' })
})

router.post('/verify_factor', async (req, res) => {
    const buildCode = (codeItems) => {
        let code = []
        for (const item in codeItems) {
            code.push(codeItems[item])
        }
        return code.join('')
    }

    const code = buildCode(req.body)
    const challenge_id = session.challenge_id

    const verify_factor = await workos.mfa.verifyFactor({
        authenticationChallengeId: challenge_id,
        code: code,
    })
    console.log(session)
        res.render('challenge_success.ejs', {
            verify_factor: verify_factor,
            type: session.current_factor.type,
        })

   
})

router.post('/registerUser',async(req,res)=>{
    try{
       
        var brandname = req.body.brandname
        var products=req.body.products
        var details=req.body.details
        var instaweblink=req.body.instaweblink
        var profileEmailId=req.body.profileEmailId
        console.log(session)
        var phonenumber=session.current_factor.sms.phone_number
        const lastBooking = await notion.databases.query({
          database_id: databaseId,
          filter: {
            property: "Phone Number",
            phone_number: {
              contains: phonenumber
            }
          }
        })
      
      if (lastBooking.results.length==0){
          bookingId=v4()
          let profileId="prof_"+v4()
          console.log(brandname)
          console.log(products)
          console.log(details)
          console.log(instaweblink)
          console.log(phonenumber)
          console.log(profileId)
          console.log(profileEmailId)
          console.log(bookingId)
      const pageProperties={
          'Tell us something about your brand': { id: 'A%5EU%3A', type: 'rich_text', rich_text: [ {
            text: {
              content: details,
            },
          }, ] },
          Products: { id: 'Y%3C%40r', type: 'rich_text', rich_text: [ {
            text: {
              content: products,
            },
          },] },
          bookingId: { id: 'ekHH', type: 'rich_text', rich_text: [{
              text: {
                content: bookingId,
              },
            },] },
          'Phone Number': { id: 'foRp', type: 'phone_number', phone_number: phonenumber },
          'Instagram/Website Link': {
            id: 'iOUE',
            type: 'url',
            url: instaweblink
          },
          profileId: { id: 'm%7D~A', type: 'rich_text', rich_text: [{
              text: {
                content: profileId,
              },
            },] },
          EmailId: { id: 'yOMu', type: 'email', email: profileEmailId },
          BrandName: { id: 'title', type: 'title', title: [ {
            text: {
              content: brandname,
            },
          },] }
        }
      console.log(pageProperties)
      addNotionPageToDatabase(databaseId,pageProperties)
      sendMail(profileEmailId,bookingId)
      }else{
          res.redirect('/booking')
      }
     
    
  res.redirect('https://bizluru.notion.site/BIZLURU-a7aabd35e23c47aea4e8db1d276bc088')
  }catch (error) {
      res.render('error.ejs', { error: error })
  }
})

router.get('/challenge_success', async (req, res) => {
    res.render('challenge_success.ejs', { title: 'Challenge Success' })
})

router.get('/booking', (req, res) => {
    res.redirect('/')
})
router.get('/clear_session', (req, res) => {
    session.factors = []
    res.redirect('/')
})

export default router
