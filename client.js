module.exports = {
  ensureElectron: function (req, res, next) {
    if (navigator.userAgent.toLowerCase().indexOf(" electron/") > -1) {
      return next();
    }
            console.log(process);
            console.log(process.versions);
            console.log(process.versions.electron);

    req.flash("error_msg", "Please download the client!");
    res.redirect("/users/login");
  },
};
