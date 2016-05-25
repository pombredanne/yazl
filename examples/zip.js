var usage =
  "node " + __filename.replace(/.*[\/\\]/, "") + " " +
  "[FILE | --compress | --no-compress | --buffer | --no-buffer | --zip64={true|false|auto}]... -o OUTPUT.zip" + "\n" +
  "\n" +
  "all arguments and switches are processed in order. for example:" + "\n" +
  "  node zip.js --compress a.txt --no-compress b.txt -o out.zip" + "\n" +
  "would result in compression for a.txt, but not for b.txt.";
var yazl = require("../");
var fs = require("fs");

var zipfile = new yazl.ZipFile();
var options = {compress: false, zip64: false};
var use_buffer = false;

var args = process.argv.slice(2);
if (Math.max(args.indexOf("-h"), args.indexOf("--help")) !== -1) {
  console.log("usage: " + usage);
  process.exit(1);
}
// this one's important
if (args.indexOf("-o") === -1) throw new Error("missing -o");
if (args.indexOf("-o") + 1 >= args.length) throw new Error("missing argument after -o");

var its_the_dash_o = false;
args.forEach(function(arg) {
  if (its_the_dash_o) {
    its_the_dash_o = false;
    var stream = arg === "-" ? process.stdout : fs.createWriteStream(arg);
    zipfile.outputStream.pipe(stream);
  } else if (arg === "--compress") {
    options.compress = true;
  } else if (arg === "--no-compress") {
    options.compress = false;
  } else if (arg === "--buffer") {
    use_buffer = true;
  } else if (arg === "--zip64=true") {
    options.zip64 = true;
  } else if (arg === "--zip64=false") {
    options.zip64 = false;
  } else if (arg === "--zip64=auto") {
    options.zip64 = "auto";
  } else if (arg === "--no-buffer") {
    use_buffer = false;
  } else if (arg === "-o") {
    its_the_dash_o = true;
  } else if (arg === "-") {
    zipfile.addReadStream(process.stdin);
  } else {
    // file thing
    var stats = fs.statSync(arg);
    if (stats.isFile()) {
      if (use_buffer) {
        zipfile.addBuffer(fs.readFileSync(arg), arg, options);
      } else {
        zipfile.addFile(arg, arg, options);
      }
    } else if (stats.isDirectory()) {
      zipfile.addEmptyDirectory(arg);
    } else {
      throw new Error("what is this: " + arg);
    }
  }
});
zipfile.end({zip64: options.zip64});
