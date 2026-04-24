import https from 'https';
import fs from 'fs';

const url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzM5NWQ4Mjc2OTk4YTRhYmE5NWY3MTI0MDQ3NTMyZDA4EgsSBxCSu4n1xwsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDU1NDA1NDc0NTE0NDA3MTk4NQ&filename=&opi=89354086';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('stitch_ui.html', data);
    console.log('Saved stitch_ui.html');
  });
}).on('error', err => {
  console.error(err);
});
