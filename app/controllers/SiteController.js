class SiteController {
  // [GET] /
  index(req, res, next) {
    let userData = { ...req.userData };
    res.redirect("/global/userlist");
    // res.render("home", { userData });
  }
}

module.exports = new SiteController(); // export class
