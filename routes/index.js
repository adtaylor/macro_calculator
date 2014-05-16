
/*
 * GET home page.
 */


exports.index = function(req, res){
  res.render('index', { title: 'Macro Calculator For Cutting Widget', url: req.get('host') + req.originalUrl });
};
