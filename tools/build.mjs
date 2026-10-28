// Regenerates link previews: og/*.png (screenshots of tools/og.html) and t/CODE.html
// (one small page per type whose preview names the type, then forwards to the result).
// Run after changing type names or SITE in data.js:  node tools/build.mjs
import fs from "node:fs";
import vm from "node:vm";
import {execFileSync} from "node:child_process";
import {fileURLToPath, pathToFileURL} from "node:url";

const root=fileURLToPath(new URL("..",import.meta.url));
const data={}; vm.runInNewContext(fs.readFileSync(root+"data.js","utf8")+";this.TYPES=TYPES;this.SITE=SITE",data);
const base=`https://${data.SITE}/`;
const chrome=process.env.CHROME||"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const og=pathToFileURL(root+"tools/og.html").href;
fs.mkdirSync(root+"og",{recursive:true}); fs.mkdirSync(root+"t",{recursive:true});

const shot=(query,name)=>execFileSync(chrome,["--headless=new","--disable-gpu","--hide-scrollbars","--window-size=1200,630",
  "--virtual-time-budget=8000",`--screenshot=${root}og/${name}.png`,og+query],{stdio:"ignore"});

shot("","default");
for(const [code,{en,ar}] of Object.entries(data.TYPES)){
  shot("?t="+code,code);
  const title=`${code} – ${en[0]} · ${ar[0]}`;
  fs.writeFileSync(`${root}t/${code}.html`,`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="Which of the 16 types are you? · أيّ الأنماط الـ16 أنت؟">
<meta property="og:type" content="website">
<meta property="og:image" content="${base}og/${code}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script>location.replace("../"+location.hash)</script>
</head>
<body><a href="../">Take the 16 types test</a></body>
</html>
`);
  console.log(code);
}
