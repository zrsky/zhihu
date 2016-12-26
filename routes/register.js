/**
 * Created by morning on 2016/12/26.
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var form = new formidable.IncomingForm();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('register', {});
});

router.post('/', function(req, res, next){
    console.log('rcv post')
    form.parse(req, function(err, fields, file){
        console.log(fields)
    })
})

module.exports = router;