require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const { customAlphabet } = require("nanoid");

const app = express();

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  4
);

app.use(express.urlencoded({ extended: false }));
app.use(
  cors({ origin: process.env.FRONTEND_URL.split(" "), credentials: true })
);

const nl2br = (str) => {
  if (typeof str === "undefined" || str === null) {
    return "";
  }
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + "<br>" + "$2"
  );
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/test.html");
});

app.post("/send", function (req, response) {
  const url =
    "https://git.door43.org/api/v1/repos/" +
    process.env.OWNER +
    "/" +
    process.env.REPO +
    "/contents/" +
    process.env.FILE +
    "?access_token=" +
    process.env.TOKEN;

  axios
    .get(url)
    .then((res) => {
      if (res.status !== 200) {
        response.send({ status: false, error: "Status " + res.status });
        return false;
      }
      const buff = Buffer.from(res.data.content, "base64");
      const sha = res.data.sha;
      const text =
        buff.toString("utf8") +
        "\n" +
        req.body.ref +
        "\t" +
        nanoid() +
        "\t\t" +
        nl2br(req.body.selected) +
        "\t" +
        nl2br(req.body.comment);

      axios
        .put(url, {
          content: Buffer.from(text, "utf8").toString("base64"),
          sha: sha,
        })
        .then((res) => {
          response.send({ status: true });
          return true;
        })
        .catch((error) => {
          response.send({ status: false, error: error });
          return false;
        });
    })
    .catch((error) => {
      response.send({ status: false, error: error });
      return false;
    });
});

app.post("/send-to-file", function (req, response) {
  const url =
    "https://git.door43.org/api/v1/repos/" +
    process.env.OWNER +
    "/" +
    process.env.REPO +
    "/contents/" +
    req.body.type +
    "/err_" +
    String(req.body.bookId).toUpperCase() +
    ".tsv?access_token=" +
    process.env.TOKEN;

  axios
    .get(url)
    .then((res) => {
      if (res.status != 200) {
        response.send({ status: false, error: "Status " + res.status });
        return false;
      } else {
        const buff = Buffer.from(res.data.content, "base64");
        const sha = res.data.sha;
        const text =
          buff.toString("utf8") +
          "\n" +
          req.body.ref +
          "\t" +
          nanoid() +
          "\t\t" +
          nl2br(req.body.selected) +
          "\t" +
          nl2br(req.body.comment);

        axios
          .put(url, {
            content: Buffer.from(text, "utf8").toString("base64"),
            sha: sha,
          })
          .then((res) => {
            response.send({ status: true });
            return true;
          })
          .catch((error) => {
            response.send({ status: false, error: error });
            return false;
          });
      }
    })
    .catch((error) => {
      if (error?.response?.data?.message == "GetContentsOrList") {
        const text =
          "Reference\tID\tTags\tQuote\tNote" +
          "\n" +
          req.body.ref +
          "\t" +
          nanoid() +
          "\t\t" +
          nl2br(req.body.selected) +
          "\t" +
          nl2br(req.body.comment);
        axios
          .post(url, {
            content: Buffer.from(text, "utf8").toString("base64"),
          })
          .then((res) => {
            response.send({ status: true });
            return true;
          })
          .catch((error) => {
            response.send({ status: false, error: error });
            return false;
          });
      } else {
        response.send({ status: false, error: "Status " + res.status });
        return false;
      }
    });
});

app.listen(process.env.PORT || 3000);
