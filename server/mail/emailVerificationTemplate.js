const otpTemplate = (otp) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            body{
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container{
                max-width: 60px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .logo{
                max-width: 200px;
                margin-bottom: 20px;
            }
            .message{
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .body{
                font-size: 16px;
                margin-bottom: 20px;
            }
            .cta{
                display: inline-block;
                padding: 10px 20px;
                background-color: #ffd60a;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bol;
                margin-top: 20px;
            }
            .support{
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
            .highLight{
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="https://studynotion-edtech-project.vercel.app"><img class="logo" src="#" alt="Studynotion logo"></a>
            <div class="message">Otp verification Email</div>
    
            <div class="body">
                <p>Hey User,</p>
                <p>Thank you for registration with studynotion To complete your registration, please use the following Otp to verify your account</p>
                <h2 class="highLight">${otp}</h2>
                <p>this otp is valid for 5 minutes. if you did not request this verification,  disgard this message Once your account is verified you will have access to platform and it's features</p>
            </div>
    
               
             
            <div class="support">If you any quetion or need assistance , please feel free to reach out to us <a href="mailto:info@studynotion.com">We are here to help you</a></div>
            
        </div>
        
    </body>
    </html>`
}
module.exports = otpTemplate;