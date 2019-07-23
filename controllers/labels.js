
const Label = require("../models/label");

module.exports = app => {
// CREATE
        app.post("/labels", (req, res) => {
            var currentUser = req.user;
            labels = Array.from(new Set(req.body.labels.split(" ")))
            for (let i = 0; i < labels.length; i++){
                Label.findOne({name: labels[i]}).then(label => {
                    console.log(labels[i], label)
                  if (!label) {
                        const new_label = new Label();
                        new_label.author.push(currentUser);
                        new_label.name = labels[i];
                        new_label.save()
                    } else {
                        checkIfNewAuthor = true
                        for (let i = 0; i < label.author.length; i++){
                            if (label.author[i] == currentUser){
                                checkIfNewAuthor = false
                                console.log("author already exists.")
                            }
                        }
                        if (checkIfNewAuthor){
                            label.author.push(currentUser);
                            label.save();
                        }
                    }
                })
            }
                res.redirect("/")
            });

};
