module.exports = (app) => {
  const imgPic = req.session.useInfo.img
  app.use((req, res, next) => {
    
    // this middleware runs whenever requested page is not available
    res.status(404).render("not-found.hbs", {imgPic});
  });

  app.use((err, req, res, next) => {    
    // whenever you call next(err), this middleware will handle the error
    // always logs the error
    const imgPic = req.session.userInfo.img
    console.error("ERROR", req.method, req.path, err);

    // only render if the error ocurred before sending the response
    if (!res.headersSent) {
      res.status(500).render("error", {imgPic});
    }
  });
};
