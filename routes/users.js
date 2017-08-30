var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/ff', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
