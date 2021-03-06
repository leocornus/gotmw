'use strict';

const mwclient = require('../../src/index');

// we will execute the script by using nvm, for example:
// $ nvm run node get-category-members.js private.mysite.com username password cagetoryTitle
const rawParams = process.argv.slice(2);
console.log(rawParams);

// set wiki options.
mwclient.setWikiOptions( {
    apiUrl: "https://" + rawParams[0] + "/w/api.php",
    privateWiki: true,
    username: rawParams[1],
    password: rawParams[2],
} );

(async () => {

    let itemsRes = await mwclient.apiCall( {
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:' + rawParams[3],
        cmlimit: 15,
        format: 'json'
    } );
    // default request method is GET
    //, "GET" );
    console.log(itemsRes);

    itemsRes.data.query.categorymembers.forEach( item => {
        console.log( `${item.pageid}: ${item.title}` );
    } );
})();
