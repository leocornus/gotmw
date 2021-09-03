/**
 * The interactive command line client to access en.wikipedia.org.
 * It is using the prompt (https://github.com/flatiron/prompt) package to
 * provide the capability to talk to end users.
 */

const prompt = require('prompt');

//const wikipedia = require('../../src/api');
const wikipedia = require('./../src/index.js');

// pre-load some action examples:
// this is a sample of the file, it is an array of action request object.
// It is a simple JSON format at this time.
// We will update to use SQLite or Solr.
let actions = require('./action-examples.json');

// the API url for wikipedia site.
const wikipediaApi= "https://en.wikipedia.org/w/api.php";
// all API url for mediawiki site.
// We could find the meidawiki API documentation from here.
const mediawikiApi = "https://www.mediawiki.org/w/api.php";

// All binary files for wikipedia.org is stored on site commons.wikimedia.org
// Sometime, we will use this for testing.
//const wikipediaApi= "https://commons.wikimedia.org/w/api.php";

async function main() {

    // preparing the prompt message for end user to get started.
    const schema = {
        properties: {
            action: {
                description: [
                    "",
                    //"Welcome to Wikipedia API Smart Agent",
                    "====================================",
                    "Please type command to start or 'help' to show commands:",
                    "",
                ].join('\n'),
            },
        },
    };

    let userInput = await prompt.get( schema );
    while( userInput.action != "q" ) {

        // show user's input.
        //console.table(userInput);
        if( userInput.action.startsWith("config") ) {
            userInput.value = userInput.action.split("config ")[1];
            userInput.action = "config";
        } else if( userInput.action.startsWith("action") ) {
            userInput.value = userInput.action.split("action ")[1];
            userInput.action = "action";
        } else if( userInput.action.startsWith("loadexamples") ) {
            userInput.value = userInput.action.split("loadexamples ")[1];
            userInput.action = "loadexamples";
        } else if( userInput.action.startsWith("upload") ) {
            //userInput.value = userInput.action.split("upload ")[1];
            // using string is safer and makes more sense.
            userInput.value = userInput.action.substring("upload ".length);
            userInput.action = "upload";
        } else if( /example\[[0-9]+\]/.test( userInput.action ) ) {
            // load the example and set the action.
            const index = parseInt( userInput.action.match( /example\[([0-9]+)\]/)[1] );
            userInput.value = actions[index];
            userInput.action = "example";
        }

        switch( userInput.action ) {
            case "help":
                showHelpMessage();
                break;
            case "config":
                console.log("Setup wiki API settings");
                // set new properties
                wikipedia.setWikiOptions( JSON.parse( userInput.value ) );
                // show all settings.
                console.dir(wikipedia.getWikiOptions());
                break;
            case "settings":
                console.log("Show the current wiki API settings:");
                console.dir(wikipedia.getWikiOptions());
                break;
            case "action":
                console.log("Start to perform action");
                await handleApiAction( JSON.parse(userInput.value) );
                break;
            case "login":
                console.log("Log into a private wiki site");
                await wikipedia.login();
                break;
            case "upload":
                console.log("Perform upload action");
                //console.log(userInput);
                //console.log( JSON.parse(userInput.value) );
                await handleUpload( JSON.parse(userInput.value) );
                break;
            case "examples":
                console.log("Showing examples:");
                //console.table(actions);
                showExamples(actions);
                break;
            case "example":
                console.log("Start to perform action");
                await handleApiAction( userInput.value );
                break;
            case "loadexamples":
                console.log("Load action examples");
                actions = require( userInput.value );
                showExamples(actions);
                break;
            default:
                console.log("");
                console.log("Not Supported option:", userInput.action);
                console.log("");
                break;
        }

        userInput = await prompt.get( schema );
    }
}

// 
main().catch( e => {
    console.error(e);
    throw e;
} );

/**
 * the main function to process api actions.
 */
async function handleApiAction(actionParams) {

    // force the return format to json
    actionParams.format = 'json';
    //console.table(request);
    console.dir(actionParams);

    // send request and process response.
    await showResult( actionParams );
}

/**
 * utility function to show the action result.
 */
async function showResult( params ) {

    const data = await wikipedia.apiCall( params );
    console.log("Wiki action API result:");
    console.log(JSON.stringify(data, null, 2));
    //console.dir(data);
}

/**
 * Utility function to perform the upload action.
 */
async function handleUpload( params ) {

    const data = await wikipedia.upload( params.filepath, params.filename,
        params.text, params.comment );
    console.log("Upload result:");
    console.log(JSON.stringify( data, null, 2 ));
}

/**
 * utility function to display action examples.
 * Action examples should store in JSON format.
 * In the wiki agent, we expected to show all examples one line for each.
 * This function will preparing each example in one line string.
 */
function showExamples( examples ) {

    const samples = examples.map( example => {
        // using the default stringify, no replacer and no space
        return JSON.stringify( example );

        // TODO: introduce the "description" field for each actions
        //       in the examples json file.
        //       We will return a array with description and the actural action
        //return [
        //    "some descriptions",
        //    JSON.stringify( example )
        //];
    } );

    // table will show all samples in table with index id as the first column.
    // The only thing I don't like is all values are align in the center,
    // which is arnnoying to read!
    //console.table(samples);

    // the spread operator (...) will use the index id as the name for
    // each item in an array.
    // It is the best choice we can have now.
    console.log({...samples});
}

/**
 * show the help information for wiki-agent.
 */
function showHelpMessage( ) {

    const msg = [
        "help - show the help message",
        "settings - show current API settings",
        "config { } - setup API settings",
        "login - login to a private wiki",
        "action { } - perform the MediaWiki API read action",
        "upload { } - perform the upload action",
        "examples - show action examples",
        "example[i] - perform a example action specified by the index id",
        "loadexamples FILE_PATH - load examples from json file",
        //"savehistory - save history to files",
        "q - quit",
    ];

    // console log method will add color for each item of an array
    console.log(msg);
}
