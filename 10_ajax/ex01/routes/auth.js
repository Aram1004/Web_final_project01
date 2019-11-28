module.exports = (app, passport) => {
  app.get('/signin', (req, res, next) => {        
    res.render('signin');
  });

  app.post('/signin', passport.authenticate('local-signin', {    //passport 로 
    successRedirect : '/questions', // redirect to the secure profile section
    failureRedirect : '/signin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages 실패시 flash띄워 주세요.
  }));

  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope : 'email' })
  );

  app.get('/auth/facebook/callback',   
    passport.authenticate('facebook', {
      failureRedirect : '/signin',
      failureFlash : true // allow flash messages
    }), (req, res, next) => {
      req.flash('success', 'Welcome!');
      res.redirect('/questions');
    }
  );

  app.get('/signout', (req, res) => {
    req.logout();  
    req.flash('success', 'Successfully signed out');
    res.redirect('/');
  });
};
