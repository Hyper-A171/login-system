let MySheets  = SpreadsheetApp.getActiveSpreadsheet();
let LoginSheet  = MySheets.getSheetByName("DATA"); 

function doGet(e) {
  var output = HtmlService.createTemplateFromFile('index');
  
  var sess = getSession();
   if (sess.loggedIn) {
    //  output = HtmlService.createTemplateFromFile('main');
     let page = e.parameter.page;        
      if (page == null) page = "main";     
      var output = HtmlService.createTemplateFromFile(page); 
  }
    

  return output.evaluate()

}

function includeHeader() 
{
   return HtmlService.createTemplateFromFile("header.html").evaluate().getContent();
}

function forgotPass(pUID)
 {

    let RetrunMsg = 'warning,User Not Registered';

    let ReturnData = LoginSheet.getRange("A:A").createTextFinder(pUID).matchEntireCell(true).findAll();
    let StartRow = 0;
    ReturnData.forEach(function (range) {
      StartRow = range.getRow();
    });


    if (StartRow > 0) 
    {
        let userName = LoginSheet.getRange(StartRow, 3).getValue();
        let userPass = LoginSheet.getRange(StartRow, 2).getValue();

        let MsgBody  =   "<h4>Hello, <b>"+userName+"</b><p>Your Password is </p></h4><h1>"+userPass+"</h1>";
      
        MailApp.sendEmail({to: pUID, name:"Hyper-A", subject: "Your Password", htmlBody: MsgBody});
        RetrunMsg = 'success, Password has been sent to your Mail';
    }

    return RetrunMsg;
}

function myURL() {
  return ScriptApp.getService().getUrl();
}
function setSession(session) {
  var sId   = Session.getTemporaryActiveUserKey();
  var uProp = PropertiesService.getUserProperties();
  uProp.setProperty(sId, JSON.stringify(session));
}
function getSession() {
  var sId   = Session.getTemporaryActiveUserKey();
  var uProp = PropertiesService.getUserProperties();
  var sData = uProp.getProperty(sId);
  return sData ? JSON.parse(sData) : { loggedIn: false };
}
function loginUser(pUID, pPassword) {
    
    if (loginCheck(pUID, pPassword)) {
      
      var sess = getSession();
      sess.loggedIn = true;
      setSession(sess);

        return 'success';
    } 
    else {
        return 'failure';
    }
}
function logoutUser() {
  var sess = getSession();
  sess.loggedIn = false;
  setSession(sess);
}
function loginCheck(pUID, pPassword) {
  let LoginPass =  false;
      let ReturnData = LoginSheet.getRange("A:A").createTextFinder(pUID).matchEntireCell(true).findAll();
        
        ReturnData.forEach(function (range) {
          let StartRow = range.getRow();
          let TmpPass = LoginSheet.getRange(StartRow, 2).getValue();
          if (TmpPass == pPassword)
          {
              LoginPass = true;
          }
        });

    return LoginPass;
}
function OpenPage(PageName)
{
    return HtmlService.createHtmlOutputFromFile(PageName).getContent();
}
function UserRegister(pUID, pPassword, pName) {
    
    let RetMsg = '';
    let ReturnData = LoginSheet.getRange("A:A").createTextFinder(pUID).matchEntireCell(true).findAll();
    let StartRow = 0;
    ReturnData.forEach(function (range) {
      StartRow = range.getRow();
    });

    if (StartRow > 0) 
    {
      RetMsg = 'danger, User Already Exists';
    }
    else
    {
      LoginSheet.appendRow([pUID, pPassword, pName]) ;  
      RetMsg = 'success, User Successfully Registered'; 
    }

    return  RetMsg;
}
function sendPassword(id,nm)
{
   let OTP = "" + Math.ceil((Math.random() + 1) * 1000);
   OTP = OTP.substring(0,6);

   let MsgBody =   "<h4>Hello, <b>"+nm+"</b><p>Your OTP for Login</p></h4><h1>"+OTP+"</h1>";
   
   //MailApp.sendEmail(id, "OTP For Login", MsgBody);
    MailApp.sendEmail({to: id, subject: "OTP For Login", htmlBody: MsgBody});
    

    var sess = getSession();
    sess.OTP = OTP;
    setSession(sess);

    return 'success, OTP has been sent to your Mail';
}

function CheckOTP(pUID, pPassword, pName, pOTP)
{

    var sess = getSession();
     if (sess.OTP == pOTP) 
     {
          return UserRegister(pUID, pPassword, pName) ;
     }
     else
     {
          return 'danger, OTP Not Matched';

     }
}
