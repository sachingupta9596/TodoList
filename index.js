const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/Date.js");
var Items = ["buy-food", "cook-food", "eat-food"];

const app = express();
app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://dbuser:dbuser@cluster0.hakag.mongodb.net/todolistDB?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);
const itemSchema = {
  name: String,
};
const Item = mongoose.model("todoitem", itemSchema);

const item1 = new Item({
  name: "Welcome",
});
const item2 = new Item({
  name: "hello",
});
const defaultItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  let day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("List", { kindofDay: "Today", newListItems: foundItems });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: [],
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("List", {
          kindofDay: foundList.name,
          newListItems: foundList.items,
        }); // show an existing list
      }
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listname === "today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listname);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "today") {
    Item.findByIdAndRemove(checkboxId, (err) => {
      if (!err) {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkboxId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
app.get("/about", (req, res) => {
  res.render("About");
});

app.listen(3000, () => {
  console.log("server running");
});
