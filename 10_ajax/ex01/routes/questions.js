const express = require('express');
const Question = require('../models/question');
const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {    //이 함수가 참이면 로그인이 된사람 함수가 거짓이면 로그인이 안된사람.
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET questions listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},   //$options': 'i'   대소문자 구별 안하게 옵션 
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
/*
startNo = (page-1)*10;

totalNum = await Post.count();
post = await Post.find({}).skip(startNo).limit(10);
totalPage = Math.ceil(totalNum/10)

a(href='/posts?page=${i}')=i

:::mongoose pagenation 찾아보기 
*/
  const questions = await Question.paginate(query, {
    sort: {createdAt: -1},    //최신글 부터 보이게
    populate: 'author',     ///author 필드에 대해서 join과 같이 채워주세요. 라는 말. 
    page: page, limit: limit
  });
  res.render('questions/index', {questions: questions, term: term, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('questions/new', {question: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  res.render('questions/edit', {question: question});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate('author');
  const answers = await Answer.find({question: question.id}).populate('author');
  question.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await question.save();
  res.render('questions/show', {question: question, answers: answers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  question.title = req.body.title;
  question.content = req.body.content;
  question.tags = req.body.tags.split(" ").map(e => e.trim());

  await question.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/questions');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Question.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/questions');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var question = new Question({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await question.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/questions');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    question: question._id,
    content: req.body.content
  });
  await answer.save();
  question.numAnswers++;
  await question.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/questions/${req.params.id}`);
}));



module.exports = router;
