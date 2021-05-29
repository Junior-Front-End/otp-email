var app = require('express')();
var cookieParser = require('cookie-parser')
var sendOTPEmail = require('./otp/OTP-Email.js')

// app.use
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers","x-access-token, Origin, Content-Type, Accept");
    next();
  });

// global
var rand, email;

// -------------------------------------------------------
//            /api/otp_email
// -------------------------------------------------------
app.get('/api/otpemail',function(req,res) {
 
    if(
        Number(req.query.num1) === rand.num1 &&
        Number(req.query.num2) === rand.num2 &&
        Number(req.query.num3) === rand.num3 &&
        Number(req.query.num4) === rand.num4 
    ){ 
        res.cookie('Content-Type', {checkMessage: 'ایمیل شما تایید شد!'});
        res.redirect('/form_otp_email');
    }else{ 
        res.cookie('Content-Type', {checkMessage: 'نادرست وارد شده است'});
        res.redirect('/form_otp_email');
    }

})
// -------------------------------------------------------
//            /form_otp_email
// -------------------------------------------------------
app.get('/form_otp_email',function (req,res) {

    // if no message from api
    if (!req.cookies['Content-Type']) {
        // if email is not exists
        email = req.query.email;
        if(!email){
            res.cookie('Content-Type', {formMessage: 'لطفا ایمیل وارد کنید!'})
            res.redirect('/')
        }
    }

    // get the message from api
    var message = req.cookies['Content-Type'].checkMessage || '';
    res.cookie('Content-Type','');

    // send the code
    rand = sendOTPEmail(email);


    // ----------------------- send-again form
    var sendAgainForm, checkForm;

    if (message === 'نادرست وارد شده است') {
        sendAgainForm = `
        <form action="/form_otp_email" method="GET" >
        <input type="email" name="email" value="${email}" hidden />
        <input type="submit" value="ارسال مجدد" />
        </form>
        `;
    }else{ 
        sendAgainForm = '' 
    }

    // ----------------------- check form
    if (message === 'ایمیل شما تایید شد!') {
        checkForm = `
        <div style="direction: rtl; text-align:right;margin: 2em auto">
        <h1>هوراا ... ایمیل تایید شد!</h1>
        <a href="/">دوباره بازی کنید! </a>
        </div>
        `;
    } else {
        checkForm = `
        <div>
        <p>رمز به ایمیل شما ارسال شده است. لطفا وارد نمایید!</p>
        <form action="/api/otpemail" method="get">
        <input type="number" max="9" name="num1"><br>
        <input type="number" max="9" name="num2"><br>
        <input type="number" max="9" name="num3"><br>
        <input type="number" max="9" name="num4"><br><br>
        <input type="submit" value="ادامه"> 
        </form>
        </div>
        `;
    }

    // ------------------------------------ res.send 
    res.send(`
    <div style="direction:rtl;margin:2em auto;text-align:right">
        <h1>تایید ایمیل</h1>
        ${checkForm} 
        <p>${message}</p>
        ${sendAgainForm}
    </div>
    `);
})

// -------------------------------------------------------
//                      home route
// -------------------------------------------------------
app.get('/',function(req,res) {
 
    var message = req.cookies['Content-Type'].formMessage || '';
    res.cookie('Content-Type','');
    
    res.send(`
    <div style="direction:rtl;margin:2em auto;text-align:right">
        <h1>ثبت نام</h1>
        <p>ایمیل خود را وارد کنید تا رمز یکبار مصرف ارسال شود!</p>
        <form action="/form_otp_email" method="GET">
        <input type="email" name="email" style="direction:ltr">
        <input type="submit" value="ادامه">
        </form>
        ${message}
    </div>
    `)
})

// -------------------------------------------------------
//                       create server
// -------------------------------------------------------
app.listen(3000);