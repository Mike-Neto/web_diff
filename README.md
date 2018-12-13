# web_diff
Diff two websites by URL

## Install instructions
### img_diff
You need img_diff in your PATH.
You can see install instructions from the [img_diff repo](https://github.com/Mike-Neto/img_diff)

### Dependencies
This project requires you to npm install as it relies on the puppeteer package which needs to install chromium localy.
    npm i

## Testing
    npx tsc && npm test


## Runinig
Update config.ts with your info

    npx tsc && npm start

## Future Features

* Provide feedback while taking screenshots
* Allow for arbitrary code & style injection