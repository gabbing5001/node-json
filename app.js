var express = require("express");
var app = express(); //어플리케이션 객체 만들기
var bodyParser = require("body-parser");
var fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.locals.pretty = true; //html이 줄바꿈이 안되서 템플릿 줄바꿈 하기 위한 설정
app.set("views", "./views");
app.set("view engine", "jade");

app.listen(3000, function() {
  //3천번 포트 연결시 콜백 실행
  console.log("Connected, 3000 port!");
});
app.get("/", function(req, res) {
  res.render("new");
});
app.get("/list", function(req, res) {
  //user리스트를 띄운다.
  //json 데이터가 있는 파일을 읽어와서 html에 띄운다
  fs.readFile("data/user.json", { encoding: "utf-8" }, function(err, data) {
    var users = JSON.parse(data);
    var user = users.user;
    res.render("list", { userList: user });
  });
});
app.get("/list/:id", function(req, res) {
  //선택한 user의 detail정보를 가져온다.
  var id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Id error" });
  }
  fs.readFile("data/user.json", { encoding: "utf-8" }, function(err, data) {
    //파일을 읽는다.
    var users = JSON.parse(data);
    var user = users.user;
    var userDetail = user.filter(function(object) {
      //파라미터로 넘어온 아이디와 파일 데이터에서 같은 id 객체 반환
      return object.id === id;
    });
    if (!userDetail) {
      return res.status(400).json({ error: "user error" });
    }
    res.render("detail", { userDetail: userDetail }); //해당 객체 띄운다
  });
});
app.post("/delete/:id", function(req, res) {
  //유저 삭제 detial화면에서 삭제 버튼 누르면 id값으로 삭제
  //원래 api 개발시에는 app.delete를 사용하지만 나는 확인을 위해 post나 get 사용
  var id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Id error" });
  }
  fs.readFile("data/user.json", { encoding: "utf-8" }, function(err, data) {
    //파일을 읽어 기존 유저 리스트 검색
    var users = JSON.parse(data);
    var user = users.user;
    var userIndex = user.findIndex(function(object) {
      //id가 같은 usert의 인덱스 반환
      return object.id === id;
    });
    user.splice(userIndex, 1); //배열에서 제거
    //제거된 배열을 파일에 덮어쓴다
    var aJson = new Object();
    aJson.user = user;
    var sJson = JSON.stringify(aJson);
    fs.writeFile("data/user.json", sJson, function(err, data) {
      //파일에 덮어쓰기
      console.log("삭제되었습니다.");
    });
    res.redirect("/list"); //덮어쓰기후 list 화면으로 돌아가기
  });
});
app.get("/create", function(req, res) {
  //유저생성 화면 띄우기
  res.render("newForm");
});
app.post("/create", function(req, res) {
  //유저 생성해서 json파일에 내용추가
  var name = req.body.name;
  var age = req.body.age;
  var email = req.body.email;
  fs.readFile("data/user.json", { encoding: "utf-8" }, function(err, data) {
    var users = JSON.parse(data);
    var user = users.user;
    var id = user.reduce(function(maxId, user) {
      //마지막 배열의 id값을 반환
      if (user.id > maxId) {
        return user.id;
      } else {
        return maxId;
      }
    }, 0);
    id = parseInt(id) + 1; //새로운 id 값 생성

    var newUser = {
      //새로은 객체 추가
      id: String(id),
      name: name,
      age: age,
      email: email
    };
    user.push(newUser); //배열에 객체 추가

    var aJson = new Object();
    aJson.user = user;
    var sJson = JSON.stringify(aJson);
    fs.writeFile("data/user.json", sJson, function(err, data) {
      //파일에 덮어쓰기
      console.log("추가되었습니다.");
    });
    res.redirect("/list");
  });
});
app.get("/update/:id", function(req, res) {
  //update화면 불러오기
  var id = req.params.id;
  fs.readFile("data/user.json", { encoding: "utf-8" }, function(err, data) {
    //파일을 읽는다.
    var users = JSON.parse(data);
    var user = users.user;
    var userDetail = user.filter(function(object) {
      return object.id === id;
    });
    res.render("updateForm", { userDetail: userDetail });
  });
});
app.post("/update", function(req, res) {
  //파일에 update된 정보 반영
  //JSON은 정렬이 불가능해서 기존 정보를 삭제 후 id를 계속 새롭게 줘서 update
  var id = req.body.id;
  var name = req.body.name;
  var age = req.body.age;
  var email = req.body.email;
  fs.readFile("data/user.json", { encoding: "utf-8" }, function(err, data) {
    var users = JSON.parse(data);
    var user = users.user;
    var userIndex = user.findIndex(function(object) {
      return object.id === id;
    });
    user.splice(userIndex, 1); //기존 유저 삭제

    var newId = user.reduce(function(maxId, user) {
      if (user.id > maxId) {
        return user.id;
      } else {
        return maxId;
      }
    }, 0);
    id = parseInt(newId) + 1;

    var updateUser = {
      id: String(id),
      name: name,
      age: age,
      email: email
    };
    user.push(updateUser); //업데이트 유저 마지막id로 변경해서 추가

    var aJson = new Object();
    aJson.user = user;
    var sJson = JSON.stringify(aJson);
    fs.writeFile("data/user.json", sJson, function(err, data) {
      //파일에 덮어쓰기
      console.log("수정되었습니다.");
    });
    res.redirect("/list"); //덮어쓰기후 list 화면으로 돌아가기
  });
});
