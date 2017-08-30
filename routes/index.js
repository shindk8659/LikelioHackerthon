var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
    host :'localhost',
    user : 'root',
    password : 'rootroot',
    port : 3307,
    database:'likelion',
    connectionLimit:5,
    waitForConnections:false
});


Date.prototype.YYMMDDhhmm = function() {
  var yyyy = this.getFullYear().toString();
  var mmmm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd = this.getDate().toString();
  var hh = this.getHours().toString();
  var mm = this.getMinutes().toString();

  return yyyy+':'+ (mmmm[1]?mmmm:"0"+mmmm[0]) + ':' + (dd[1]?dd:"0"+dd[0]) + ':' + (hh[1]?hh:"0"+hh[0]) + ':' + (mm[1]?mm:"0"+mm[0]);
};
var date = new Date();
var time=date.YYMMDDhhmm();


router.get('/login', function(req, res, next) {
   sess=req.session;
   console.log(sess);
  res.render('login');

});


//회원가입창
router.get('/signUp', function(req, res, next) {
  pool.getConnection(function(err,connection){
     connection.query('SELECT user_id FROM user ', function(err, rows, fields) {
       if (!err){
         console.log({rows: rows});
         res.render('signUp',{rows: rows})
       }
       else{
         console.log('Error while performing Query.');
       }
       connection.release();
     });
       });
});
//회원가입승인
router.post('/signUpOk', function(req, res, next) {
  var test=req.body;
  var ok = {};
  var data=[test["user_id"],test["user_password"],test["user_name"],test["user_sex"],test["user_age"],
              '0',"https://s3.ap-northeast-2.amazonaws.com/likelionsmu/user_img/default.png",test["user_tel"],test["user_email"]]
              console.log(data);
  pool.getConnection(function(err,connection){
        connection.query('INSERT INTO user(user_id,user_password,user_name,user_sex,user_age,user_reliability,user_img,user_tel,user_email) VALUES(?,?,?,?,?,?,?,?,?)',data,function(error, result){
      if(!error){
              ok["success"]=1;
            console.log(result);
             res.render('signUpOk');
          }else{
              ok={"success":0};
              res.redirect('/signUp');
                }
      })
      connection.release();
    });
});
//메인화면 아이디 패스워드확인
router.post('/main', function(req, res, next) {
  var test=req.body;
  var sess;
  sess = req.session;

   pool.getConnection(function(err,connection){
      connection.query('SELECT user_index FROM user WHERE user_id='+"'"+test["user_id"]+"'"+'and user_password='+"'"+test["user_password"]+"'", function(err, rows, fields) {
        if (!err){
           if(rows.length==0){
             res.send('<script>alert("아이디나 비밀번호가 틀렸습니다"); location.href="/login"</script>')
            }else{
                      var username = JSON.stringify(rows)
                      console.log(username);
                      username = JSON.parse(username)

                    console.log(username[0]["user_index"]);
              sess.user_index = parseInt(username[0]["user_index"]);
              console.log(sess.user_index);
             res.render("main")
           }
        }
        else{
          console.log('Error while performing Query.');

        }
        connection.release();
      });
        });
});

router.get('/searchmeeting/:check', function(req, res, next) {
   var check = req.params.check
   sess=req.session;
   console.log(sess);

      pool.getConnection(function(err,connection){
         connection.query('SELECT * FROM bulletin WHERE bulletin_category='+"'"+check+"'", function(err, rows, fields) {
           if (!err){

                 console.log({rows: rows,success:1});
                 res.render('searchmeeting',{rows: rows,success:1});
           }
           else{
             console.log('Error while performing Query.');

           }
           connection.release();
         });
           });
});


router.post('/search', function(req, res, next) {
   var check = req.params.check
   var test = req.body;
   sess=req.session;
   console.log(sess);
   console.log("바부");
   console.log(test["bulletin_apply_limit"]);
   if(test["bulletin_meeting_date"]==""){
     test["bulletin_meeting_date"]="9999:99:99:99:99"
   }
   console.log(test["bulletin_meeting_date"]);
      pool.getConnection(function(err,connection){
         connection.query("SELECT * FROM user u,bulletin b WHERE b.user_index=u.user_index AND (b.bulletin_meeting_date BETWEEN"+"'"+time+"'"+"AND"+"'"+test["bulletin_meeting_date"]+"'"+
         ") And b.bulletin_apply_limit <="+"'"+test["bulletin_apply_limit"]+"'"+"and bulletin_category LIKE"+"'"+test["bulletin_category"]+"'"+"AND b.bulletin_place like'%"+test["bulletin_place"]+"%'"
, function(err, rows, fields) {
           if (!err){
                 console.log({rows: rows});
                 var username = JSON.stringify(rows)
                 username = JSON.parse(username)
                 console.log(rows);
              if(rows==""){
                console.log({rows: [{"bulletin_category":test["bulletin_category"]}]});

                   res.render('searchmeeting',{success:0,rows:[],ca: [{"bulletin_category":test["bulletin_category"]}]});
              }else{

                  console.log({rows: [{"bulletin_category":test["bulletin_category"]}]}+" asdasd");
                   res.render('searchmeeting',{success:1,rows: rows});
              }
           }
           else{
             console.log('Error while performing Query.');
           }
           connection.release();
         });
           });
});



router.get('/confirmmeeting/:check', function(req, res, next) {
  var check = req.params.check
  sess=req.session;
  console.log(sess);   pool.getConnection(function(err,connection){
        connection.query(
"SELECT DISTINCT a.* , b.make_id, b.make_img, c.user_id, c.user_img"+
" FROM (SELECT * FROM bulletin where bulletin_index =" +"'"+check+"'"+") as a"+
" LEFT OUTER JOIN "+
" (SELECT user.user_id make_id, user.user_img make_img, bulletin.bulletin_index FROM user, bulletin WHERE user.user_index=bulletin.user_index AND bulletin.bulletin_index =" +"'"+check+"'"+") AS b ON a.bulletin_index = b.bulletin_index"+
" LEFT OUTER JOIN"+
" (SELECT user.user_id user_id, user.user_img user_img, apply.bulletin_index FROM user, apply WHERE user.user_index=apply.user_index AND apply.bulletin_index =" +"'"+check+"'"+") AS c ON b.bulletin_index = c.bulletin_index;"
          , function(err, rows, fields) {
          if (!err){
                console.log({rows: rows});
                res.render('confirmmeeting',{rows: rows});
          }
          else{
            console.log('Error while performing Query.');

          }
          connection.release();
        });
          });
});

router.post('/enter/:check', function(req, res, next) {
  var checktime
  var check=req.params.check;
  var test = req.body;
  sess = req.session

  var data=[sess.user_index,parseInt(check),0,test["user_name"],time]
              console.log(data);
              console.log(sess.user_index);
  pool.getConnection(function(err,connection){
    connection.query('SELECT bulletin_meeting_date FROM bulletin WHERE bulletin_index='+"'"+check+"'", function(err, rows, fields) {
      if (!err){
        if(sess.user_index==undefined){
          res.send('<script>alert("세션이 만료되었습니다. 다시로그인 해주세요"); location.href="/login"</script>')
        }else{
        var username = JSON.stringify(rows)
        username = JSON.parse(username)
        console.log(username[0]["bulletin_meeting_date"]);
        console.log(time);
          if(username[0]["bulletin_meeting_date"]<time){
            res.send('<script>alert("기간이 만료되었습니다. 다시로그인 해주세요"); location.href="/main"</script>')
          }else{

                    connection.query('INSERT INTO apply(user_index,bulletin_index,apply_status,apply_message,apply_date) VALUES(?,?,?,?,?)',data,function(error, result){
              if(!error){
                  console.log(result);
                  res.send('<script>alert("참가신청이 완료되었습니다."); location.href="/main"</script>')
              }else{
                  res.send('<script>alert("참가신청을 불가능합니다."); location.href="/main"</script>');
              }
            })
            }
        }
      }
      else{
        console.log('Error while performing Query.');
      }
    });
    connection.release();
    });
});

router.get('/main', function(req, res, next) {
   sess=req.session;
   console.log(sess);
  res.render('main');
});


//로그아웃
router.get('/logout', function(req, res){
  sess=req.session;
  if(sess.user_index){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/login');
                }
            })
        }else{
            res.redirect('/login');
        }
});


//게시물 글쓰기 완료
router.post('/createBulletinOk', function(req, res, next) {
  var test=req.body;
  var ok = {};
  var data=[1,test["bulletin_title"],test["bulletin_content"],33.48,126.49,
            time,time,"img_png",2,0,1,9,test["bulletin_openchatting"]]
              console.log(data);
  pool.getConnection(function(err,connection){
        connection.query("INSERT INTO bulletin(user_index,bulletin_title,bulletin_content,bulletin_latitude,bulletin_longitude,bulletin_reg_date,bulletin_meeting_date,bulletin_img,bulletin_apply_limit,"+
          "bulletin_apply_status,bulletin_status,bulletin_category,bulletin_openchatting) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",data,function(error, result){
      if(!error){
              ok["success"]=1;
            console.log(result);
             res.render('createBulletinOk');
          }else{
              ok={"success":0};
              console.log("aa");
              res.redirect('/createBulletin/1');
          }
      });
      connection.release();
    });
});




//내가 만든 모임 확인하기
router.get('/imademeeting', function(req, res, next) {
  var sess = req.session;
  var userIndex = sess.user_index;

  pool.getConnection(function(err,connection){
        connection.query('SELECT * FROM bulletin WHERE user_index='+"'"+ userIndex +"'"+';'
          ,function(error, result){
            if(!error){
              console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
              res.render('imademeeting', {rows : result});
            }
            else{
              console.log('Error while performing Query.');
            }
      });
      connection.release();
    });
});

//내가 만든 모임 정보보기
router.get('/meetinginfo_manager/:bulletIndex', function(req, res, next) {
  var bulletIndex = req.params.bulletIndex;

  pool.getConnection(function(err,connection){
        connection.query('SELECT * FROM bulletin WHERE bulletin_index='+"'"+ bulletIndex +"'"+';'//해당 게시글 정보 받기
          ,function(error, result){
            if(!error){
              var bulletinInfo = result[0];

              //신청중인 사람 받아오기
              pool.getConnection(function(err,connection){
                    connection.query('select u.user_index, u.user_id, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index ='+"'"+ bulletIndex +"'"+' AND apply_status=1 ;'
                      ,function(error, result){
                        if(!error){
                          var applicant1 = result;
                          var error = 0;

                          //신청수락된 사람 받아오기
                          pool.getConnection(function(err,connection){
                                connection.query('select u.user_index, u.user_id, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index ='+"'"+ bulletIndex +"'"+' AND apply_status=0 ;'
                                  ,function(error, result){
                                    if(!error){
                                      var applicant0 = result;
                                      var error = 0;

                                      res.render('meetinginfo_manager',{bulletinInfo, applyList: applicant1, appliedList: applicant0, bulletIndex, error });
                                    }else{
                                    }
                              });
                              connection.release();
                          });
                        }else{
                        }
                  });
                  connection.release();
                });
            }else{
            }
      });
      connection.release();
    });
});



router.get('/mymeeting', function(req, res, next) {
  var content = req.param('bulletin_index');
  sess=req.session;
  console.log(sess);

        //대기상태 게시글
         pool.getConnection(function(err,connection){
            connection.query('SELECT DISTINCT a.* ,b.*, c.user_id, c.user_img FROM apply a, bulletin b, user c WHERE a.bulletin_index = b.bulletin_index AND b.user_index = c.user_index AND a.user_index =' + "'"+ sess.user_index+ "'" + 'AND a.apply_status=0', function(err, rows, fields) {

              if (!err){

                //메인에서 로그인 안하면 다른 페이지 못들어감
                if(sess.user_index==undefined){
                          res.send('<script>alert("세션이 만료되었습니다. 다시로그인 해주세요"); location.href="/login"</script>')
                        }
                else{
                    console.log({rows: rows}+"sdfsdf");
                    res.render('mymeeting',{rows: rows});
                  }
              }
              else{
                console.log('Error while performing Query.');
              }


             connection.release();
             });
      });

});


//신청하고있는 유저 정보보기(Post방식)
router.post('/profileconfirm_manager', function(req, res, next) {
  var userIndex = req.body.value1;
  var bullIndex = req.body.value2;
  var error = 0;

  pool.getConnection(function(err,connection){
        connection.query('select u.user_index, u.user_id, u.user_name, u.user_sex, u.user_age, u.user_tel, u.user_email, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index = '+"'"+ bullIndex +"'"+'AND u.user_index = '+"'"+ userIndex +"'"+'AND apply_status=1 ;'
          ,function(error, result){
            if(!error){

              var applicant = result[0];
              res.render('profileconfirm_manager', {applicant : applicant, bullIndex, error});
            }
            else{
            }
      });
      connection.release();
    });
});

//신청하고있는 유저 정보보기(get방식)
router.get('/profileconfirm_manager/(:applicantIndex)&(:bullIndex)', function(req, res, next) {
  var userIndex = req.params.applicantIndex;
  var bullIndex = req.params.bullIndex;

  pool.getConnection(function(err,connection){
        connection.query('select u.user_index, u.user_id, u.user_name, u.user_sex, u.user_age, u.user_tel, u.user_email, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index = '+"'"+ bullIndex +"'"+'AND u.user_index = '+"'"+ userIndex +"'"+'AND apply_status=1 ;'
          ,function(error, result){
            if(!error){
              //ok["success"]=1;
              var applicant = result[0];
              res.render('profileconfirm_manager', {applicant : applicant, bullIndex, "error" : 1});
            }
            else{
            }
      });
      connection.release();
    });
});

//신청수락하기
router.get('/applyAccept/(:applicantIndex)&(:bullIndex)', function(req, res, next) {
  var applicantIndex = req.params.applicantIndex;
  var bullIndex = req.params.bullIndex;
  pool.getConnection(function(err,connection){
        connection.query('select bulletin_apply_limit, bulletin_apply_status from bulletin where bulletin_index = '+"'"+ bullIndex +"'"+';'
          ,function(error, result){
            if(!error){
              if(result[0].bulletin_apply_limit > result[0].bulletin_apply_status ){
                pool.getConnection(function(err,connection){
                    connection.query('UPDATE apply a, bulletin b SET a.apply_status=0 , b.bulletin_apply_status = b.bulletin_apply_status + 1 WHERE b.bulletin_index = a.bulletin_index and b.bulletin_index = '+"'"+ bullIndex +"'"+' and a.user_index = '+"'"+ applicantIndex +"'"+';');//유저인덱스알아야해 아니면 그냥 순서만알아도괜춘할듯
                    connection.release();
                  });
                  let redirectUrl = '/meetinginfo_manager/' + bullIndex ;
                  res.redirect(redirectUrl);
              }else{

                pool.getConnection(function(err,connection){
                    connection.query('UPDATE bulletin SET bulletin_status=1 WHERE bulletin_index = '+"'"+ bullIndex +"'"+';');
                    connection.release();
                  });
                let redirectUrl = '/profileconfirm_manager/' + applicantIndex + "&" + bullIndex ;
                res.redirect(redirectUrl);//alert창 띄우면서 더이상 수락할 수 없습니다.거절버튼을 누르세요. 라고하자
              }
            }
            else{
            }
      });
      connection.release();
    });
});

//신청거절하기
router.get('/applyRefuse/(:applicantIndex)&(:bullIndex)', function(req, res, next) {
  var applicantIndex = req.params.applicantIndex;
  var bullIndex = req.params.bullIndex;

  pool.getConnection(function(err,connection){
        connection.query('UPDATE apply a, bulletin b SET a.apply_status=2 WHERE b.bulletin_index = a.bulletin_index and b.bulletin_index = '+"'"+ bullIndex +"'"+' and a.user_index = '+"'"+ applicantIndex +"'"+';'//유저인덱스알아야해 아니면 그냥 순서만알아도괜춘할듯
          ,function(error, result){
            if(!error){
              let redirectUrl = '/meetinginfo_manager/' + bullIndex ;
              res.redirect(redirectUrl);
            }
            else{
            }
      });
      connection.release();
    });
});

//신청 수락된 사람 정보보기
router.post('/profileconfirm_usr', function(req, res, next) {
  var userIndex = req.body.value1;
  var bullIndex = req.body.value2;
  var error = 0;


  pool.getConnection(function(err,connection){
        connection.query('select u.user_index, u.user_id, u.user_name, u.user_sex, u.user_age, u.user_tel, u.user_email, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index = '+"'"+ bullIndex +"'"+'AND u.user_index = '+"'"+ userIndex +"'"+'AND apply_status=0 ;'
          ,function(error, result){
            if(!error){

              var applicant = result[0];
              res.render('profileconfirm_usr', {applicant : applicant, bullIndex, error});
            }
            else{
            }
      });
      connection.release();
    });
});

router.post('/profileconfirm_usr_2', function(req, res, next) {
  var userIndex = req.body.value1;
  var bullIndex = req.body.value2;
  var error = 0;


  pool.getConnection(function(err,connection){
        connection.query('select u.user_index, u.user_id, u.user_name, u.user_sex, u.user_age, u.user_tel, u.user_email, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index = '+"'"+ bullIndex +"'"+'AND u.user_index = '+"'"+ userIndex +"'"+'AND apply_status=0 ;'
          ,function(error, result){
            if(!error){

              var applicant = result[0];
              res.render('profileconfirm_usr_2', {applicant : applicant, bullIndex, error});
            }
            else{
            }
      });
      connection.release();
    });
});


// router.get('/meetingchange', function(req, res, next) {
//   res.render('meetingchange');
// });

//수연
// 게시글 내용 수정
router.get('/meetingchange', function(req, res, next){
  sess = req.session;

  var id = req.param('bulletin_index');
  pool.getConnection(function(err,connection){
    var sql = 'SELECT * FROM bulletin WHERE bulletin_index='+"'"+id+"'";
    connection.query(sql, function(err, meetinginfo) {
      if (!err){ //정상

        res.render('meetingchange',{meetinginfo: meetinginfo})
      }
      else{ //에러 발생
        console.log('Error while performing Query.');
      }
      connection.release();
    });
  });
});


//게시글 수정 완료
router.post('/meetingchangeOK', function(req, res, next){
    sess=req.session;
    var test = req.body;
   console.log(test);
    var meeting_title = req.body.meeting_title;
    var meeting_explain = req.body.meeting_explain;
    var date = req.body.date;
    var kakao = req.body.kakao;
    var bulletin_index = req.body.bulletin_index;
    var category = req.body.category;
    var number = req.body.number;
    var idx = sess.user_index;
    var latitude = req.body.bulletin_latitude;
    var longitude = req.body.bulletin_longitude;
    var place = req.body.bulletin_place;
    console.log(req.body.bulletin_place);

    var data = [test["meeting_title"], test["meeting_explain"], test["date"], test["number"], test["category"], test["kakao"], test["bulletin_latitude"], test["bulletin_longitude"], test["bulletin_place"], bulletin_index];

   pool.getConnection(function(err,connection){
     var sql = 'UPDATE bulletin SET  bulletin_title=?, bulletin_content=?, bulletin_meeting_date=?, bulletin_apply_limit=?, bulletin_category=?, bulletin_openchatting=?, bulletin_latitude=?, bulletin_longitude=?, bulletin_place=? WHERE bulletin_index=?';
     connection.query(sql, data, function(err, updateinfo){
       if(!err){
          var sqlquery = 'SELECT * FROM bulletin WHERE user_index='+"'"+idx+"'";
          connection.query(sqlquery, function(err, rows){
            console.log(rows);
           res.render('imademeeting',{rows:rows});
          });
        } else {
         console.log('Error while performing Query.');
       }
     connection.release();
    });
  });

});
//
// 게시글 삭제
router.get('/deletemeeting', function(req, res, next){
  var bullIndex = req.param('bulletin_index');


  pool.getConnection(function(err, connection){
    connection.query('DELETE FROM bulletin WHERE bulletin_index='+"'"+ bullIndex +"';", function(err, meetinginfo){
      if(err){
        console.log(err);
      } else {
          res.redirect('/imademeeting');
      }
    });
  });
});

//수빈
router.get('/waitaccept', function(req, res, next) {
  var content = req.param('bulletin_index');
  sess=req.session;
  console.log(sess);

        //대기상태 게시글
         pool.getConnection(function(err,connection){
            connection.query('SELECT DISTINCT a.* ,b.*, c.user_id, c.user_img FROM apply a, bulletin b, user c WHERE a.bulletin_index = b.bulletin_index AND b.user_index = c.user_index AND a.user_index =' + "'"+ sess.user_index+ "'" + 'AND (a.apply_status=1 or a.apply_status=2)', function(err, rows, fields) {

              if (!err){
                //메인에서 로그인 안하면 다른 페이지 못들어감
                if(sess.user_index==undefined){
                          res.send('<script>alert("세션이 만료되었습니다. 다시로그인 해주세요"); location.href="/login"</script>')
                        }
                else{

                    res.render('waitaccept',{rows: rows});
                  }
              }
              else{
                console.log('Error while performing Query.');
              }


             connection.release();
             });
      });

});

router.get('/profilechange', function(req, res, next) {
   pool.getConnection(function(err,connection){
      connection.query('SELECT user_id FROM user ', function(err, rows, fields) {

       if (!err){ //정상
          console.log({rows: rows});
          res.render('profilechange',{rows: rows})
        }
        else{ //에러 발생
          console.log('Error while performing Query.');
        }
        connection.release();
      });
        });
 });
router.post('/uploadOk', function(req, res, next) {
  var form = new formidable.IncomingForm();//
  var sess;
  sess = req.session;

  console.log(form);
  form.parse(req, function(err, fields, files){

        var s3 = new AWS.S3();
        var params = {
             Bucket:'likelionsmu/user_img',
             Key:sess.user_index,
             ACL:'public-read',
             Body: require('fs').createReadStream(files.user_img.path)
        }
        console.log(params.Bucket);
        s3.upload(params, function(err, data){
             var result='';
             if(err){
                 result = 'Fail';
                 pool.getConnection(function(err,connection){
                       connection.query('UPDATE user SET user_img='+"'"+"https://s3.ap-northeast-2.amazonaws.com/likelionsmu/user_img/"+sess.user_index+"'"+' WHERE user_index='+sess.user_index+';',function(error, result){
                     if(!error){
                           console.log(result);
                          }else{
                             console.log(sess.user_index);
                               }
                     })
                     connection.release();
                       });
                   result = '<img src="${data.Location}">';
                   console.log(files.user_img.name);
                   console.log(result)

             }else{
               pool.getConnection(function(err,connection){
                     connection.query('UPDATE user SET user_img='+files.user_img.name+' WHERE user_index='+sess.user_index+';',function(error, result){
                   if(!error){
                           ok["success"]=1;
                         console.log(result);
                        }else{
                           ok={"success":0};
                           console.log(data);
                             }
                   })
                   connection.release();
                     });
                 result = '<img src="${data.Location}">';
                 console.log(files.user_img.name);
                 console.log(result)
               }
            res.render("profilechangeOk")
        });//
    });
    });
router.get('/makemeeting', function(req, res, next) {
/*  var output = '<html><body><form enctype="multipart/form-data" method="post" action="upload_receiver"><input type="file" name="userfile"><input type="submit"></form></body></html>';
  res.send(output);*/
  pool.getConnection(function(err,connection){
     connection.query('SELECT bulletin_title FROM bulletin', function(err, rows, fields) {
       if (!err){
         console.log({rows: rows});
         res.render('makemeeting',{rows: rows})
       }
       else{
         console.log('Error while performing Query.');
       }
       connection.release();
     });
       });
});
router.post('/makemeetingOk', function(req, res, next) {
  var sess;
  sess = req.session;
  var test=req.body;
  var ok = {};
  console.log(test);

  var data=[sess.user_index,test["bulletin_title"],test["bulletin_content"],test["bulletin_latitude"],test["bulletin_longitude"],test["bulletin_place"],
            time,test["bulletin_meeting_date"],"no",test["bulletin_apply_limit"],0,1,test["bulletin_category"],test["bulletin_openchatting"]]
              console.log(data);
  pool.getConnection(function(err,connection){
        connection.query('INSERT INTO bulletin(user_index,bulletin_title,bulletin_content,bulletin_latitude,bulletin_longitude,bulletin_place,bulletin_reg_date,bulletin_meeting_date,bulletin_img,bulletin_apply_limit,bulletin_apply_status,bulletin_status,bulletin_category,bulletin_openchatting) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',data,function(error, result){
      if(!error){
              ok["success"]=1;
            console.log(result);
             res.render('makemeetingOk');
          }else{
              ok={"success":0};
              console.log("asdasd");
                res.redirect('/makemeeting');
              //res.redirect('/makemeeting');
              }
      })
      connection.release();
    });

  });



//하나의 정보 가져오기
router.get('/meetinginfo_usr', function(req, res, next) {

  var content = req.param('bulletin_index');
  sess=req.session;
  console.log(sess);

          //하나의 정보 가져오기
          pool.getConnection(function(err,connection){
            if(content){
              connection.query('SELECT * FROM bulletin WHERE bulletin_index='+"'"+content+"'", function(err,rows,fields){
                      if(err){
                        console.log("err");
                      } else {

                        pool.getConnection(function(err,connection){
                              connection.query('select u.user_index, u.user_id, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index ='+"'"+ content +"'"+' AND apply_status=0 ;'
                                ,function(error, result){
                                  if(!error){
                                    var applicant = result;
                                    res.render('meetinginfo_usr', {rows:rows, appliedList: applicant, content});
                                  }else{
                                    res.render('meetinginfo_usr', {rows:rows, content});
                                  }
                                })
                            });
                            connection.release();
                        }

                    });
            }
            else{
              console.log('Error while performing Query.');
            }
            connection.release();
      });
});
router.get('/meetinginfo_applyokusr', function(req, res, next) {

  var content = req.param('bulletin_index');
  sess=req.session;
  console.log(sess);

          //하나의 정보 가져오기
          pool.getConnection(function(err,connection){
            if(content){
              connection.query('SELECT * FROM bulletin WHERE bulletin_index='+"'"+content+"'", function(err,rows,fields){
                      if(err){
                        console.log("err");
                      } else {

                        pool.getConnection(function(err,connection){
                              connection.query('select u.user_index, u.user_id, u.user_img from apply a, user u where a.user_index=u.user_index AND bulletin_index ='+"'"+ content +"'"+' AND apply_status=0 ;'
                                ,function(error, result){
                                  if(!error){
                                    var applicant = result;

                                    res.render('meetinginfo_applyokusr', {rows:rows, appliedList: applicant, content});
                                  }else{

                                    res.render('meetinginfo_applyokusr', {rows:rows, content});
                                  }
                                })
                            });
                            connection.release();
                        }

                    });
            }
            else{
              console.log('Error while performing Query.');
            }
            connection.release();
      });
});

router.get('/delete', function(req, res, next) {
   sess=req.session;

   var content = req.param('bulletin_index');

   pool.getConnection(function(err,connection){
     if(content){
       connection.query('DELETE FROM apply WHERE bulletin_index='+"'"+content+"'", function(err,rows,fields){
               if(err){
                 console.log("Error while performing Query.");
               } else {

                   res.redirect('/waitaccept');
               }
             });
     }
     else{
       console.log('Error while performing Query.');
     }
     connection.release();
   });
});



module.exports = router;
