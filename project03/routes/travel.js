const express = require('express');
const User = require('../models/user');
const Travel = require('../models/travel');
const router = express.Router();
const catchErrors = require('../lib/async-error');

function needAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.flash('danger', 'Please signin first.');
		res.redirect('/signin');
	}
}
function needAdminAuth(req, res, next) {
	if (req.isAuthenticated()) {
		console.log(req.user.group)
		if (req.user.group!=0)
			next();
		else {
			req.flash('danger', 'You are not admin.');
			res.redirect('../');
		}
	} else {
		req.flash('danger', 'Please signin first.');
		res.redirect('/signin');
	}
}

function validateForm(form, options) {
	var name = form.name || "";
	var email = form.email || "";
	name = name.trim();
	email = email.trim();

	if (!name) {
		return 'Name is required.';
	}


	return null;
}

/* GET users listing. */
router.get('/', needAdminAuth, catchErrors(async (req, res, next) => {
	const users = await Travel.find({});
	if(!users)users=[]

	res.render('travel/index', { travels: users });
}));

router.get('/list', catchErrors(async (req, res, next) => {
	const users = await Travel.find({});
	res.render('travel/list', { travels: users });
}));

router.get('/new', (req, res, next) => {
	res.render('travel/new', { messages: req.flash() });
});

router.get('/:id/edit', needAdminAuth, catchErrors(async (req, res, next) => {
	const travel = await Travel.findById(req.params.id);
	res.render('travel/edit', { travel: travel });
}));

router.put('/:id', needAuth, catchErrors(async (req, res, next) => {
	const err = validateForm(req.body);
	if (err) {
		req.flash('danger', err);
		return res.redirect('back');
	}

	const travel = await Travel.findById({ _id: req.params.id });
	if (!travel) {
		req.flash('danger', 'Not exist travel.');
		return res.redirect('back');
	}

	/*
	if (!await travel.validatePassword(req.body.current_password)) {
		req.flash('danger', 'Current password invalid.');
		return res.redirect('back');
	}
	 */
	travel.name = req.body.name;
	travel.description = req.body.description;
	travel.course = req.body.course;
	travel.picture = req.body.picture;
	await travel.save();
	req.flash('success', 'Updated successfully.');
	res.redirect('/travel');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
	const travel = await Travel.findOneAndRemove({ _id: req.params.id });
	req.flash('success', 'Deleted Successfully.');
	res.redirect('/travel');
}));

router.get('/:id', catchErrors(async (req, res, next) => {
	const travel = await Travel.findById(req.params.id);
	res.render('travel/show', { travel: travel });
}));

router.get('/booking/:id', catchErrors(async (req, res, next) => {
	const travel = await Travel.findById(req.params.id);
	const user = await User.findOne({email: req.user.email});
	user.travel.append(travel)

	user.save()

	req.flash('success', 'Booking Successfully.');
	res.redirect('/travel');
}));


router.post('/', catchErrors(async (req, res, next) => {
	var err = validateForm(req.body, { needPassword: true });
	if (err) {
		req.flash('danger', err);
		return res.redirect('back');
	}
	var user = await User.findOne({ email: req.body.email });
	if (user) {
		req.flash('danger', 'Email address already exists.');
		return res.redirect('back');
	}
	user = new Travel({
		name: req.body.name,
		description: req.body.description,
		price: req.body.price,
		course: req.body.course,
		picture: req.body.picture,
	});

	await user.save();
	req.flash('success', 'Registered successfully. Please sign in.');
	res.redirect('/');
}));

module.exports = router;
